import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Navbar, Nav, Container, Button, Badge, Spinner } from 'react-bootstrap';
import { balanceAPI, settlementAPI } from '../api/axios';
import { FaSignOutAlt } from 'react-icons/fa';
import '../styles/Navigation.css';

const Navigation = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const [owedAmount, setOwedAmount] = React.useState(null);
  const [settlementsCount, setSettlementsCount] = React.useState(null);
  const [metaLoading, setMetaLoading] = React.useState(false);

  React.useEffect(() => {
    const loadMeta = async () => {
      setMetaLoading(true);
      try {
        // Always fetch overall totals across all groups
        if (user && user.id) {
          const bres = await balanceAPI.getOverallUserBalance();
          const od = bres.data || {};
          setOwedAmount(od.totalOwes || 0);
        } else {
          setOwedAmount(null);
        }

        try {
          const sres = await settlementAPI.getMySettlements();
          const sl = sres.data.settlements || sres.data || [];
          setSettlementsCount(sl.length);
        } catch (err) {
          setSettlementsCount(null);
        }
      } catch (err) {
        console.error('Failed to load nav meta', err);
        setOwedAmount(null);
        setSettlementsCount(null);
      } finally {
        setMetaLoading(false);
      }
    };

    loadMeta();
  }, [user]);

  return (
    <Navbar bg="primary" expand="lg" sticky="top" className="navbar-custom">
      <Container>
        <Navbar.Brand
          onClick={() => navigate('/groups')}
          style={{ cursor: 'pointer', color: 'white', fontSize: '24px', fontWeight: 'bold' }}
        >
          💰 Expense Sharing
        </Navbar.Brand>

        {isAuthenticated && (
          <>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="ms-auto align-items-center">
                <Nav.Link
                  onClick={() => navigate('/groups')}
                  className="nav-link-custom me-3"
                >
                  Groups
                </Nav.Link>
                <Nav.Link
                  onClick={() => navigate('/payments')}
                  className="nav-link-custom me-3 d-flex align-items-center"
                >
                  Payments
                  {metaLoading ? (
                    <Spinner animation="border" size="sm" className="ms-2" />
                  ) : (
                    <Badge bg="light" text="dark" className="ms-2">
                      {owedAmount === null ? '-' : `$${parseFloat(owedAmount).toFixed(2)}`}
                    </Badge>
                  )}
                </Nav.Link>
                <Nav.Link
                  onClick={() => navigate('/settlements')}
                  className="nav-link-custom me-3 d-flex align-items-center"
                >
                  Settlements
                  <Badge bg="light" text="dark" className="ms-2">{settlementsCount === null ? '-' : settlementsCount}</Badge>
                </Nav.Link>
                <span className="text-white me-3">
                  <strong>{user?.name}</strong>
                </span>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleLogout}
                  className="d-flex align-items-center gap-2"
                >
                  <FaSignOutAlt /> Logout
                </Button>
              </Nav>
            </Navbar.Collapse>
          </>
        )}
      </Container>
    </Navbar>
  );
};

export default Navigation;
