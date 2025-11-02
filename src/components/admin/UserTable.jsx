import { useState } from 'react';
import PropTypes from 'prop-types';
import { Table, Badge, Button, ButtonGroup, Dropdown } from 'react-bootstrap';
import {
  ArrowUp,
  ArrowDown,
  Pencil,
  Trash,
  Lock,
  Unlock,
  ThreeDotsVertical,
} from 'react-bootstrap-icons';
import { format } from 'date-fns';
import UserStatusBadge from './UserStatusBadge';

/**
 * Get badge variant based on role
 */
const getRoleBadgeVariant = (role) => {
  switch (role?.toUpperCase()) {
    case 'ROLE_ADMIN':
      return 'danger';
    case 'ROLE_USER':
      return 'primary';
    case 'ROLE_VIEWER':
      return 'secondary';
    default:
      return 'info';
  }
};

/**
 * Format role name for display
 */
const formatRoleName = (role) => {
  if (!role) return '';
  // Remove ROLE_ prefix if present
  return (
    role.replace('ROLE_', '').charAt(0) +
    role.replace('ROLE_', '').slice(1).toLowerCase()
  );
};

/**
 * UserTable - Table component for displaying users in admin panel
 */
const UserTable = ({ users, onEdit, onDelete }) => {
  const [sortField, setSortField] = useState('username');
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' or 'desc'

  /**
   * Handle column sort
   */
  const handleSort = (field) => {
    if (sortField === field) {
      // Toggle sort order if same field
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default to ascending
      setSortField(field);
      setSortOrder('asc');
    }
  };

  /**
   * Sort users
   */
  const sortedUsers = [...users].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];

    // Handle dates
    if (sortField === 'createdAt' || sortField === 'updatedAt') {
      aVal = aVal ? new Date(aVal).getTime() : 0;
      bVal = bVal ? new Date(bVal).getTime() : 0;
    }

    // Handle strings
    if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase();
      bVal = bVal?.toLowerCase() || '';
    }

    // Compare
    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  /**
   * Render sort indicator
   */
  const renderSortIndicator = (field) => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' ? (
      <ArrowUp size={14} className="ms-1" />
    ) : (
      <ArrowDown size={14} className="ms-1" />
    );
  };

  /**
   * Handle user deletion
   */
  const handleDelete = (user) => {
    if (
      !window.confirm(
        `Are you sure you want to delete user "${user.username}"?`
      )
    ) {
      return;
    }
    if (onDelete) {
      onDelete(user.id);
    }
  };

  /**
   * Handle user edit
   */
  const handleEdit = (user) => {
    if (onEdit) {
      onEdit(user);
    }
  };

  return (
    <div className="table-responsive">
      <Table hover className="align-middle">
        <thead className="table-light">
          <tr>
            <th
              style={{ cursor: 'pointer', userSelect: 'none' }}
              onClick={() => handleSort('username')}
            >
              Username {renderSortIndicator('username')}
            </th>
            <th
              style={{ cursor: 'pointer', userSelect: 'none' }}
              onClick={() => handleSort('email')}
              className="d-none d-md-table-cell"
            >
              Email {renderSortIndicator('email')}
            </th>
            <th className="d-none d-lg-table-cell">Roles</th>
            <th
              style={{ cursor: 'pointer', userSelect: 'none' }}
              onClick={() => handleSort('status')}
            >
              Status {renderSortIndicator('status')}
            </th>
            <th
              style={{ cursor: 'pointer', userSelect: 'none' }}
              onClick={() => handleSort('createdAt')}
              className="d-none d-xl-table-cell"
            >
              Created {renderSortIndicator('createdAt')}
            </th>
            <th className="text-end" style={{ width: '120px' }}>
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedUsers.map((user) => (
            <tr key={user.id}>
              {/* Username */}
              <td>
                <div className="d-flex flex-column">
                  <span className="fw-medium">{user.username}</span>
                  {/* Email on mobile */}
                  <small className="text-muted d-md-none">{user.email}</small>
                </div>
              </td>

              {/* Email */}
              <td className="d-none d-md-table-cell">
                <span className="text-muted">{user.email}</span>
              </td>

              {/* Roles */}
              <td className="d-none d-lg-table-cell">
                {user.roles && user.roles.length > 0 ? (
                  <div className="d-flex gap-1 flex-wrap">
                    {user.roles.map((role, index) => (
                      <Badge key={index} bg={getRoleBadgeVariant(role)}>
                        {formatRoleName(role)}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <span className="text-muted">—</span>
                )}
              </td>

              {/* Status */}
              <td>
                <UserStatusBadge status={user.status} />
              </td>

              {/* Created Date */}
              <td className="d-none d-xl-table-cell">
                {user.createdAt
                  ? format(new Date(user.createdAt), 'MMM d, yyyy')
                  : 'N/A'}
              </td>

              {/* Actions */}
              <td className="text-end">
                {/* Desktop Actions */}
                <ButtonGroup size="sm" className="d-none d-lg-flex">
                  <Button
                    variant="outline-secondary"
                    onClick={() => handleEdit(user)}
                    title="Edit User"
                  >
                    <Pencil size={16} />
                  </Button>
                  <Button
                    variant="outline-danger"
                    onClick={() => handleDelete(user)}
                    title="Delete User"
                  >
                    <Trash size={16} />
                  </Button>
                </ButtonGroup>

                {/* Mobile Dropdown */}
                <Dropdown className="d-lg-none">
                  <Dropdown.Toggle variant="outline-secondary" size="sm">
                    <ThreeDotsVertical />
                  </Dropdown.Toggle>

                  <Dropdown.Menu align="end">
                    <Dropdown.Item onClick={() => handleEdit(user)}>
                      <Pencil className="me-2" />
                      Edit User
                    </Dropdown.Item>
                    {user.status === 'locked' ? (
                      <Dropdown.Item>
                        <Unlock className="me-2" />
                        Unlock User
                      </Dropdown.Item>
                    ) : (
                      <Dropdown.Item>
                        <Lock className="me-2" />
                        Lock User
                      </Dropdown.Item>
                    )}
                    <Dropdown.Divider />
                    <Dropdown.Item
                      onClick={() => handleDelete(user)}
                      className="text-danger"
                    >
                      <Trash className="me-2" />
                      Delete User
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {users.length === 0 && (
        <div className="text-center py-5 text-muted">
          <p>No users to display</p>
        </div>
      )}
    </div>
  );
};

UserTable.propTypes = {
  users: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      username: PropTypes.string.isRequired,
      email: PropTypes.string.isRequired,
      status: PropTypes.string,
      roles: PropTypes.arrayOf(PropTypes.string),
      createdAt: PropTypes.string,
    })
  ).isRequired,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onRefresh: PropTypes.func,
};

export default UserTable;
