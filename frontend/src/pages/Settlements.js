import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { groupAPI, settlementAPI } from '../api/axios';
import { Container, Row, Col, Card, Form, Alert, Spinner, ListGroup, Badge, Button, Pagination } from 'react-bootstrap';
import { FaTrash } from 'react-icons/fa';

const Settlements = () => {
    const { user: currentUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [allGroups, setAllGroups] = useState([]);
    const [groupsWithSettlements, setGroupsWithSettlements] = useState([]);

    // Filters
    const [filterGroup, setFilterGroup] = useState('all');
    const [filterMember, setFilterMember] = useState('all');
    const [filterMinAmount, setFilterMinAmount] = useState('');
    const [filterMaxAmount, setFilterMaxAmount] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('date');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Collapsed groups
    const [collapsedGroups, setCollapsedGroups] = useState(new Set());

    useEffect(() => {
        fetchAllGroupsSettlements();
    }, [currentUser]);

    const fetchAllGroupsSettlements = async () => {
        if (!currentUser || !currentUser.id) return;

        setLoading(true);
        setError('');

        try {
            const groupsRes = await groupAPI.getUserGroups();
            const groups = groupsRes.data.groups || groupsRes.data;
            setAllGroups(groups);

            const groupsWithSettlementsData = [];

            for (const group of groups) {
                try {
                    const settlementsRes = await settlementAPI.getGroupSettlements(group._id);
                    const settlements = settlementsRes.data.settlements || settlementsRes.data || [];

                    if (settlements.length > 0) {
                        groupsWithSettlementsData.push({
                            group,
                            settlements: settlements.map(s => ({
                                ...s,
                                groupId: group._id,
                                groupName: group.name,
                            })),
                        });
                    }
                } catch (err) {
                    console.error(`Failed to fetch settlements for group ${group._id}`, err);
                }
            }

            setGroupsWithSettlements(groupsWithSettlementsData);
        } catch (err) {
            console.error('Failed to fetch groups', err);
            setError('Failed to load settlements data');
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

    const handleDeleteSettlement = async (settlementId) => {
        if (!window.confirm('Delete this recorded payment?')) return;
        try {
            await settlementAPI.deleteSettlement(settlementId);
            fetchAllGroupsSettlements();
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to delete settlement');
        }
    };

    const allSettlements = groupsWithSettlements.flatMap(gws => gws.settlements);

    const totalSettlements = allSettlements.length;
    const totalAmount = allSettlements.reduce((sum, s) => sum + s.amount, 0);

    const filteredSettlements = allSettlements.filter(settlement => {
        if (filterGroup !== 'all' && settlement.groupId !== filterGroup) return false;
        if (filterMember !== 'all') {
            const fromId = settlement.from?._id || settlement.from;
            const toId = settlement.to?._id || settlement.to;
            if (fromId !== filterMember && toId !== filterMember) return false;
        }
        if (filterMinAmount && settlement.amount < parseFloat(filterMinAmount)) return false;
        if (filterMaxAmount && settlement.amount > parseFloat(filterMaxAmount)) return false;
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            const searchText = `${settlement.note || ''} ${settlement.from?.name || ''} ${settlement.to?.name || ''} ${settlement.groupName}`.toLowerCase();
            if (!searchText.includes(q)) return false;
        }
        return true;
    });

    const sortedSettlements = [...filteredSettlements].sort((a, b) => {
        if (sortBy === 'amount') return b.amount - a.amount;
        if (sortBy === 'group') return a.groupName.localeCompare(b.groupName);
        if (sortBy === 'date') return new Date(b.createdAt) - new Date(a.createdAt);
        return 0;
    });

    const groupedSettlements = sortedSettlements.reduce((acc, settlement) => {
        if (!acc[settlement.groupId]) {
            acc[settlement.groupId] = {
                groupId: settlement.groupId,
                groupName: settlement.groupName,
                settlements: [],
            };
        }
        acc[settlement.groupId].settlements.push(settlement);
        return acc;
    }, {});

    const groupedSettlementsArray = Object.values(groupedSettlements);

    const totalItems = groupedSettlementsArray.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const currentPageNum = Math.min(currentPage, totalPages);
    const startIdx = (currentPageNum - 1) * pageSize;
    const paginatedGroups = groupedSettlementsArray.slice(startIdx, startIdx + pageSize);

    // Get all unique members across all groups
    const allMembers = [];
    const memberIds = new Set();
    allGroups.forEach(group => {
        group.members.forEach(member => {
            if (!memberIds.has(member._id)) {
                memberIds.add(member._id);
                allMembers.push(member);
            }
        });
    });

    if (loading) {
        return (
            <Container className="py-5">
                <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-3">Loading settlements...</p>
                </div>
            </Container>
        );
    }

    return (
        <Container className="py-5">
            <h1 className="mb-4 text-success fw-bold">✅ All Settlements</h1>

            {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

            <Card className="mb-4 shadow-sm" style={{ background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', color: 'white' }}>
                <Card.Body>
                    <Row className="text-center">
                        <Col md={6}>
                            <h6 className="text-white-50">Total Settlements</h6>
                            <h2 className="fw-bold mb-0">{totalSettlements}</h2>
                        </Col>
                        <Col md={6}>
                            <h6 className="text-white-50">Total Amount</h6>
                            <h2 className="fw-bold mb-0">${totalAmount.toFixed(2)}</h2>
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
                        <Col md={3}>
                            <Form.Group>
                                <Form.Label className="small fw-bold">Member</Form.Label>
                                <Form.Select size="sm" value={filterMember} onChange={(e) => { setFilterMember(e.target.value); setCurrentPage(1); }}>
                                    <option value="all">All Members</option>
                                    {allMembers.map(m => (
                                        <option key={m._id} value={m._id}>{m.name}</option>
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
                        <Col md={2}>
                            <Form.Group>
                                <Form.Label className="small fw-bold">Sort By</Form.Label>
                                <Form.Select size="sm" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                                    <option value="date">Date (Newest First)</option>
                                    <option value="amount">Amount (High to Low)</option>
                                    <option value="group">Group Name</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row className="g-3 mt-1">
                        <Col md={12}>
                            <Form.Group>
                                <Form.Label className="small fw-bold">Search</Form.Label>
                                <Form.Control size="sm" type="text" placeholder="Search by note, member name, or group..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} />
                            </Form.Group>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {paginatedGroups.length === 0 ? (
                <Alert variant="info" className="text-center">
                    <h5>No settlements found</h5>
                    <p className="mb-0">Try adjusting your filters or add some settlements.</p>
                </Alert>
            ) : (
                <>
                    {paginatedGroups.map(groupData => (
                        <Card key={groupData.groupId} className="mb-3 shadow-sm">
                            <Card.Header
                                className="bg-success text-white d-flex justify-content-between align-items-center"
                                style={{ cursor: 'pointer' }}
                                onClick={() => toggleGroupCollapse(groupData.groupId)}
                            >
                                <h6 className="mb-0">
                                    {collapsedGroups.has(groupData.groupId) ? '▶' : '▼'} {groupData.groupName}
                                </h6>
                                <Badge bg="light" text="dark">
                                    {groupData.settlements.length} settlement{groupData.settlements.length !== 1 ? 's' : ''}
                                </Badge>
                            </Card.Header>
                            {!collapsedGroups.has(groupData.groupId) && (
                                <Card.Body>
                                    <ListGroup variant="flush">
                                        {groupData.settlements.map((settlement) => (
                                            <ListGroup.Item key={settlement._id} className="d-flex justify-content-between align-items-center">
                                                <div>
                                                    <div><strong>{settlement.from?.name || 'Unknown'}</strong> → <strong>{settlement.to?.name || 'Unknown'}</strong></div>
                                                    {settlement.note && <small className="text-muted d-block">{settlement.note}</small>}
                                                    <small className="text-muted">{new Date(settlement.createdAt).toLocaleString()}</small>
                                                </div>
                                                <div className="text-end">
                                                    <div className="fw-bold fs-5 text-success">${settlement.amount.toFixed(2)}</div>
                                                    <div className="mt-2">
                                                        {(currentUser && (currentUser.id === (settlement.recordedBy?._id || settlement.recordedBy))) && (
                                                            <Button size="sm" variant="outline-danger" onClick={() => handleDeleteSettlement(settlement._id)}>
                                                                <FaTrash /> Delete
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </ListGroup.Item>
                                        ))}
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

export default Settlements;
