import React, { useState, useEffect } from 'react';
import { groupAPI } from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Card, Form, Alert, Spinner } from 'react-bootstrap';
import { FaPlus, FaFolder } from 'react-icons/fa';
import '../styles/Groups.css';

const Groups = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const navigate = useNavigate();

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const response = await groupAPI.getUserGroups();
      setGroups(response.data.groups || []);
      setError('');
    } catch (err) {
      console.error('Error fetching groups:', err);
      if (err.response?.status === 401) {
        setError('Session expired. Please log in again.');
        // Clear invalid auth data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Redirect to login after a short delay
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        setError(err.response?.data?.message || 'Failed to fetch groups');
      }
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();

    // Validate input
    if (!formData.name || formData.name.trim() === '') {
      setError('Group name is required');
      return;
    }

    try {
      setError('');
      await groupAPI.createGroup(formData.name.trim(), formData.description.trim(), []);
      setFormData({ name: '', description: '' });
      setShowForm(false);
      fetchGroups();
    } catch (err) {
      console.error('Error creating group:', err);
      setError(err.response?.data?.message || 'Failed to create group');
    }
  };

  if (loading) return (
    <Container className="text-center py-5">
      <Spinner animation="border" variant="primary" />
      <p className="mt-3">Loading groups...</p>
    </Container>
  );

  return (
    <Container className="py-5">
      <Row className="mb-5">
        <Col md={8}>
          <h1 className="mb-2 text-primary fw-bold">
            <FaFolder className="me-2" />
            Your Groups
          </h1>
        </Col>
        <Col md={4} className="text-end">
          <Button
            variant={showForm ? 'danger' : 'success'}
            size="lg"
            onClick={() => setShowForm(!showForm)}
            className="d-flex align-items-center gap-2 ms-auto"
          >
            <FaPlus /> {showForm ? 'Cancel' : 'Create Group'}
          </Button>
        </Col>
      </Row>

      {error && <Alert variant="danger" className="mb-4">{error}</Alert>}

      {showForm && (
        <Card className="mb-5 shadow-sm border-0">
          <Card.Header className="bg-light">
            <h5 className="mb-0">Create New Group</h5>
          </Card.Header>
          <Card.Body>
            <Form onSubmit={handleCreateGroup}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Group Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter group name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  size="lg"
                />
              </Form.Group>
              <Form.Group className="mb-4">
                <Form.Label className="fw-bold">Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Enter group description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </Form.Group>
              <Button variant="primary" type="submit" size="lg">
                Create Group
              </Button>
            </Form>
          </Card.Body>
        </Card>
      )}

      {!groups || groups.length === 0 ? (
        <div className="text-center py-5">
          <h4 className="text-muted">No groups yet</h4>
          <p className="text-secondary">Create one to get started!</p>
        </div>
      ) : (
        <Row className="g-4">
          {groups.map((group) => (
            <Col lg={4} md={6} key={group._id}>
              <Card
                className="h-100 shadow-sm group-card cursor-pointer"
                onClick={() => navigate(`/group/${group._id}`)}
              >
                <Card.Body>
                  <Card.Title className="text-primary fw-bold mb-2">
                    {group.name || 'Unnamed Group'}
                  </Card.Title>
                  <Card.Text className="text-secondary mb-3">
                    {group.description || 'No description'}
                  </Card.Text>
                  <div className="d-flex justify-content-between text-muted small">
                    <span>👥 {(group.members && group.members.length) || 0} members</span>
                    <span>💰 {(group.expenses && group.expenses.length) || 0} expenses</span>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default Groups;
