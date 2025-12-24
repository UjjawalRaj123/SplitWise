import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { groupAPI, balanceAPI, settlementAPI, paymentAPI } from '../api/axios';
import { Container, Row, Col, Card, Form, Alert, Spinner, ListGroup, Badge, Button, Pagination } from 'react-bootstrap';
import { FaShareAlt } from 'react-icons/fa';

const Payments = () => {
    const { user: currentUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [allGroups, setAllGroups] = useState([]);
    const [groupsWithPayments, setGroupsWithPayments] = useState([]);

    // Filters
    const [filterGroup, setFilterGroup] = useState('all');
    const [filterMinAmount, setFilterMinAmount] = useState('');
    const [filterMaxAmount, setFilterMaxAmount] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('amount');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Collapsed groups
    const [collapsedGroups, setCollapsedGroups] = useState(new Set());

    useEffect(() => {
        fetchAllGroupsPayments();
    }, [currentUser]);

    const fetchAllGroupsPayments = async () => {
        if (!currentUser || !currentUser.id) return;

        setLoading(true);
        setError('');

        try {
            const groupsRes = await groupAPI.getUserGroups();
            const groups = groupsRes.data.groups || groupsRes.data;
            setAllGroups(groups);

            const groupsWithPaymentsData = [];

            for (const group of groups) {
                try {
                    const balanceRes = await balanceAPI.getUserBalance(group._id, currentUser.id);
                    const balanceData = balanceRes.data;

                    const payments = [];
                    if (balanceData && balanceData.owedBy) {
                        if (typeof balanceData.owedBy === 'object' && !Array.isArray(balanceData.owedBy)) {
                            for (const [creditorId, amount] of Object.entries(balanceData.owedBy)) {
                                if (amount > 0) {
                                    const creditor = group.members.find(m => m._id === creditorId);
                                    payments.push({
                                        creditorId,
                                        creditorName: creditor?.name || 'Unknown',
                                        creditorEmail: creditor?.email || '',
                                        amount: parseFloat(amount),
                                        groupId: group._id,
                                        groupName: group.name,
                                    });
                                }
                            }
                        } else if (Array.isArray(balanceData.owedBy)) {
                            balanceData.owedBy.forEach(item => {
                                if (item.amount > 0) {
                                    payments.push({
                                        creditorId: item.user?._id || item.user,
                                        creditorName: item.user?.name || item.userName || 'Unknown',
                                        creditorEmail: item.user?.email || '',
                                        amount: parseFloat(item.amount),
                                        groupId: group._id,
                                        groupName: group.name,
                                    });
                                }
                            });
                        }
                    }

                    if (payments.length > 0) {
                        groupsWithPaymentsData.push({ group, payments });
                    }
                } catch (err) {
                    // Silently skip groups with no balance data or errors
                    // Only log if it's not a 404 (which just means no balance data yet)
                    if (err.response?.status !== 404) {
                        console.error(`Error fetching balance for group ${group.name}:`, err.message);
                    }
                    // Continue to next group
                }
            }

            setGroupsWithPayments(groupsWithPaymentsData);
        } catch (err) {
            console.error('Failed to fetch groups', err);
            setError('Failed to load payment data');
        } finally {
            setLoading(false);
        }
    };

    const toggleGroupCollapse = (groupId) => {
        setCollapsedGroups(prev => {
            const newSet = new Set(prev);
            if (newSet.has(groupId)) {
                newSet.delete(groupId);
            } else {
                newSet.add(groupId);
            }
            return newSet;
        });
    };

    const handlePay = async (groupId, toUserId, amount) => {
        try {
            setLoading(true);
            const res = await paymentAPI.createCheckoutSession(groupId, toUserId, amount);
            const url = res.data.url || res.data.sessionUrl;
            if (url) {
                window.location.href = url;
            } else {
                setError('Failed to start payment session');
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Payment start failed');
        } finally {
            setLoading(false);
        }
    };

    const sharePaymentRequest = async (payment) => {
        if (!payment || !payment.creditorName || !payment.groupName) {
            setError('Invalid payment data');
            return;
        }

        const text = `Please pay ${payment.creditorName} ${payment.creditorEmail ? `(${payment.creditorEmail}) ` : ''}an amount of $${payment.amount.toFixed(2)} for group "${payment.groupName}".`;

        try {
            if (navigator.share) {
                await navigator.share({ title: 'Payment Request', text });
            } else {
                await navigator.clipboard.writeText(text);
                alert('Payment request copied to clipboard.');
            }
        } catch (err) {
            console.error('Share failed', err);
            try {
                await navigator.clipboard.writeText(text);
                alert('Payment request copied to clipboard.');
            } catch (_) {
                setError('Failed to share or copy payment request');
            }
        }
    };

    const recordPayment = async (groupId, toUserId, amount, paymentInfo) => {
        try {
            await settlementAPI.createSettlement(groupId, toUserId, amount, `Payment to ${paymentInfo.creditorName}`);
            alert('Payment recorded successfully!');
            fetchAllGroupsPayments();
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to record payment');
        }
    };

    const totalOwed = groupsWithPayments.reduce((sum, gwp) =>
        sum + gwp.payments.reduce((s, p) => s + p.amount, 0), 0
    );
    const totalGroups = groupsWithPayments.length;

    const allPayments = groupsWithPayments.flatMap(gwp => gwp.payments);

    const filteredPayments = allPayments.filter(payment => {
        if (filterGroup !== 'all' && payment.groupId !== filterGroup) return false;
        if (filterMinAmount && payment.amount < parseFloat(filterMinAmount)) return false;
        if (filterMaxAmount && payment.amount > parseFloat(filterMaxAmount)) return false;
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            const searchText = `${payment.creditorName} ${payment.groupName}`.toLowerCase();
            if (!searchText.includes(q)) return false;
        }
        return true;
    });

    const sortedPayments = [...filteredPayments].sort((a, b) => {
        if (sortBy === 'amount') return b.amount - a.amount;
        if (sortBy === 'group') return a.groupName.localeCompare(b.groupName);
        return 0;
    });

    const groupedPayments = sortedPayments.reduce((acc, payment) => {
        if (!acc[payment.groupId]) {
            acc[payment.groupId] = {
                groupId: payment.groupId,
                groupName: payment.groupName,
                payments: [],
            };
        }
        acc[payment.groupId].payments.push(payment);
        return acc;
    }, {});

    const groupedPaymentsArray = Object.values(groupedPayments);

    const totalItems = groupedPaymentsArray.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const currentPageNum = Math.min(currentPage, totalPages);
    const startIdx = (currentPageNum - 1) * pageSize;
    const paginatedGroups = groupedPaymentsArray.slice(startIdx, startIdx + pageSize);

    if (loading) {
        return (
            <Container className="py-5">
                <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-3">Loading payments...</p>
                </div>
            </Container>
        );
    }

    return (
        <Container className="py-5">
            <h1 className="mb-4 text-primary fw-bold">💰 All Payments</h1>

            {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

            <Card className="mb-4 shadow-sm" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                <Card.Body>
                    <Row className="text-center">
                        <Col md={6}>
                            <h6 className="text-white-50">Total You Owe</h6>
                            <h2 className="fw-bold mb-0">${totalOwed.toFixed(2)}</h2>
                        </Col>
                        <Col md={6}>
                            <h6 className="text-white-50">Across Groups</h6>
                            <h2 className="fw-bold mb-0">{totalGroups}</h2>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            <Card className="mb-4 shadow-sm">
                <Card.Header className="bg-light">
                    <h6 className="mb-0">Filters & Search</h6>
                </Card.Header>
                <Card.Body>
                    <Row className="g-3">
                        <Col md={3}>
                            <Form.Group>
                                <Form.Label className="small fw-bold">Group</Form.Label>
                                <Form.Select size="sm" value={filterGroup} onChange={(e) => { setFilterGroup(e.target.value); setCurrentPage(1); }}>
                                    <option value="all">All Groups</option>
                                    {allGroups.map(g => (
                                        <option key={g._id} value={g._id}>{g.name}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={2}>
                            <Form.Group>
                                <Form.Label className="small fw-bold">Min Amount</Form.Label>
                                <Form.Control size="sm" type="number" step="0.01" placeholder="0.00" value={filterMinAmount} onChange={(e) => { setFilterMinAmount(e.target.value); setCurrentPage(1); }} />
                            </Form.Group>
                        </Col>
                        <Col md={2}>
                            <Form.Group>
                                <Form.Label className="small fw-bold">Max Amount</Form.Label>
                                <Form.Control size="sm" type="number" step="0.01" placeholder="0.00" value={filterMaxAmount} onChange={(e) => { setFilterMaxAmount(e.target.value); setCurrentPage(1); }} />
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group>
                                <Form.Label className="small fw-bold">Search</Form.Label>
                                <Form.Control size="sm" type="text" placeholder="Search by name or group..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} />
                            </Form.Group>
                        </Col>
                        <Col md={2}>
                            <Form.Group>
                                <Form.Label className="small fw-bold">Sort By</Form.Label>
                                <Form.Select size="sm" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                                    <option value="amount">Amount (High to Low)</option>
                                    <option value="group">Group Name</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {paginatedGroups.length === 0 ? (
                <Alert variant="info" className="text-center">
                    <h5>🎉 No outstanding payments!</h5>
                    <p className="mb-0">You're all settled up.</p>
                </Alert>
            ) : (
                <>
                    {paginatedGroups.map(groupData => (
                        <Card key={groupData.groupId} className="mb-3 shadow-sm">
                            <Card.Header
                                className="bg-primary text-white d-flex justify-content-between align-items-center"
                                style={{ cursor: 'pointer' }}
                                onClick={() => toggleGroupCollapse(groupData.groupId)}
                            >
                                <h6 className="mb-0">
                                    {collapsedGroups.has(groupData.groupId) ? '▶' : '▼'} {groupData.groupName}
                                </h6>
                                <Badge bg="light" text="dark">
                                    {groupData.payments.length} payment{groupData.payments.length !== 1 ? 's' : ''}
                                </Badge>
                            </Card.Header>
                            {!collapsedGroups.has(groupData.groupId) && (
                                <Card.Body>
                                    <ListGroup variant="flush">
                                        {groupData.payments.map((payment, idx) => {
                                            const initials = payment.creditorName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
                                            return (
                                                <ListGroup.Item key={idx} className="d-flex justify-content-between align-items-center">
                                                    <div className="d-flex align-items-center gap-3">
                                                        <div style={{ width: 50, height: 50, borderRadius: 25, background: '#6c757d', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '18px' }}>
                                                            {initials}
                                                        </div>
                                                        <div>
                                                            <div><strong>To:</strong> {payment.creditorName}</div>
                                                            {payment.creditorEmail && <small className="text-muted">{payment.creditorEmail}</small>}
                                                        </div>
                                                    </div>
                                                    <div className="text-end">
                                                        <div className="fw-bold fs-5 text-danger">${payment.amount.toFixed(2)}</div>
                                                        <div className="mt-2 d-flex gap-2 justify-content-end">
                                                            <Button size="sm" variant="outline-secondary" onClick={() => sharePaymentRequest(payment)} title="Share request">
                                                                <FaShareAlt />
                                                            </Button>
                                                            <Button size="sm" variant="success" onClick={() => recordPayment(payment.groupId, payment.creditorId, payment.amount, payment)}>
                                                                Mark Paid
                                                            </Button>
                                                            <Button size="sm" variant="primary" onClick={() => handlePay(payment.groupId, payment.creditorId, payment.amount)}>
                                                                Pay Now
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </ListGroup.Item>
                                            );
                                        })}
                                    </ListGroup>
                                </Card.Body>
                            )}
                        </Card>
                    ))}

                    <div className="d-flex justify-content-between align-items-center mt-4">
                        <div className="d-flex align-items-center gap-2">
                            <span className="text-muted">Show:</span>
                            <Form.Select size="sm" style={{ width: 'auto' }} value={pageSize} onChange={(e) => { setPageSize(parseInt(e.target.value)); setCurrentPage(1); }}>
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                            </Form.Select>
                            <span className="text-muted">per page</span>
                        </div>

                        <div className="text-muted">
                            Showing {startIdx + 1}-{Math.min(startIdx + pageSize, totalItems)} of {totalItems} groups
                        </div>

                        <Pagination className="mb-0">
                            <Pagination.First disabled={currentPageNum <= 1} onClick={() => setCurrentPage(1)} />
                            <Pagination.Prev disabled={currentPageNum <= 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))} />
                            <Pagination.Item active>{currentPageNum}</Pagination.Item>
                            <Pagination.Next disabled={currentPageNum >= totalPages} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} />
                            <Pagination.Last disabled={currentPageNum >= totalPages} onClick={() => setCurrentPage(totalPages)} />
                        </Pagination>
                    </div>
                </>
            )}
        </Container>
    );
};

export default Payments;
