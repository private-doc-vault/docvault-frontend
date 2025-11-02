import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Modal, Card, Badge, ListGroup, Spinner, Alert } from 'react-bootstrap';
import rolesApi from '../../api/rolesApi';

/**
 * RoleForm - Displays detailed information about a role
 * Shows role name, description, permissions, and assigned users
 */
const RoleForm = ({ show, onHide, role, permissions, readOnly = false }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch users for this role
  useEffect(() => {
    const fetchUsers = async () => {
      if (!show || !role || !role.id) return;

      try {
        setLoading(true);
        setError(null);
        const userData = await rolesApi.fetchUsersForRole(role.id);
        setUsers(userData.users || userData || []);
      } catch (err) {
        console.error('Failed to fetch users for role:', err);
        setError('Failed to load users for this role');
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [show, role]);

  if (!role) return null;

  /**
   * Get permission names for this role
   */
  const getRolePermissionNames = () => {
    if (!role.permissions || !permissions) return [];

    return role.permissions
      .map((permId) => {
        const perm = permissions.find(
          (p) => p.id === permId || p.name === permId
        );
        return perm?.name || permId;
      })
      .sort();
  };

  const rolePermissionNames = getRolePermissionNames();

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          {readOnly ? 'View Role' : 'Role Details'}: {role.name}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {/* Role Information */}
        <Card className="mb-3">
          <Card.Header>
            <strong>Role Information</strong>
          </Card.Header>
          <Card.Body>
            <div className="mb-2">
              <strong>Name:</strong> {role.name}
            </div>
            {role.description && (
              <div className="mb-2">
                <strong>Description:</strong> {role.description}
              </div>
            )}
            <div>
              <strong>System Role:</strong>{' '}
              <Badge bg={role.isSystem ? 'primary' : 'secondary'}>
                {role.isSystem ? 'Yes' : 'No'}
              </Badge>
            </div>
          </Card.Body>
        </Card>

        {/* Permissions */}
        <Card className="mb-3">
          <Card.Header>
            <strong>Permissions ({rolePermissionNames.length})</strong>
          </Card.Header>
          <Card.Body>
            {rolePermissionNames.length > 0 ? (
              <div className="d-flex flex-wrap gap-2">
                {rolePermissionNames.map((permName, index) => (
                  <Badge key={index} bg="info" className="px-3 py-2">
                    {permName}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-muted mb-0">
                No permissions assigned to this role
              </p>
            )}
          </Card.Body>
        </Card>

        {/* Assigned Users */}
        <Card>
          <Card.Header>
            <strong>Users with this Role ({users.length})</strong>
          </Card.Header>
          <Card.Body>
            {loading && (
              <div className="text-center py-3">
                <Spinner animation="border" size="sm" role="status" />
                <p className="mt-2 mb-0 text-muted small">Loading users...</p>
              </div>
            )}

            {error && (
              <Alert variant="danger" className="mb-0">
                {error}
              </Alert>
            )}

            {!loading && !error && users.length > 0 && (
              <ListGroup variant="flush">
                {users.map((user) => (
                  <ListGroup.Item key={user.id} className="px-0">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <strong>{user.username}</strong>
                        <br />
                        <small className="text-muted">{user.email}</small>
                      </div>
                      <Badge
                        bg={
                          user.status === 'active'
                            ? 'success'
                            : user.status === 'locked'
                              ? 'danger'
                              : 'secondary'
                        }
                      >
                        {user.status || 'unknown'}
                      </Badge>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}

            {!loading && !error && users.length === 0 && (
              <p className="text-muted mb-0">
                No users currently assigned to this role
              </p>
            )}
          </Card.Body>
        </Card>
      </Modal.Body>
    </Modal>
  );
};

RoleForm.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  role: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    permissions: PropTypes.arrayOf(
      PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    ),
    isSystem: PropTypes.bool,
  }),
  permissions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      name: PropTypes.string.isRequired,
    })
  ),
  readOnly: PropTypes.bool,
};

export default RoleForm;
