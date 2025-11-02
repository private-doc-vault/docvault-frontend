import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Row,
  Col,
  Button,
  Alert,
  Spinner,
  Form,
  InputGroup,
} from 'react-bootstrap';
import { PersonPlus, Search } from 'react-bootstrap-icons';
import {
  selectUsers,
  selectPagination,
  selectFilters,
  selectUsersLoading,
  selectUsersError,
  setUsers,
  setPagination,
  setFilters,
  setLoading,
  setError,
  clearError,
} from '../../features/users/usersSlice';
import usersApi from '../../api/usersApi';
import UserTable from '../../components/admin/UserTable';
import UserForm from '../../components/admin/UserForm';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';

/**
 * UserManagementPage - Admin page for managing users
 * Displays users in a table with filters, search, and CRUD operations
 * This page is protected and requires ROLE_ADMIN
 */
const UserManagementPage = () => {
  const dispatch = useDispatch();
  const users = useSelector(selectUsers);
  const pagination = useSelector(selectPagination);
  const filters = useSelector(selectFilters);
  const loading = useSelector(selectUsersLoading);
  const error = useSelector(selectUsersError);

  // Local state
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  /**
   * Fetch users from API
   */
  const fetchUsers = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      dispatch(clearError());

      // Calculate offset from current page
      const offset = (pagination.currentPage - 1) * pagination.pageSize;

      // Build API params
      const params = {
        limit: pagination.pageSize,
        offset,
        ...(filters.search && { search: filters.search }),
        ...(filters.status && { status: filters.status }),
        ...(filters.role && { role: filters.role }),
      };

      const response = await usersApi.fetchUsers(params);

      // Update Redux state
      dispatch(setUsers(response.users || response.data || []));
      dispatch(
        setPagination({
          totalItems: response.total || response.totalItems || 0,
          totalPages:
            response.totalPages ||
            Math.ceil((response.total || 0) / pagination.pageSize),
        })
      );
    } catch (err) {
      console.error('Failed to fetch users:', err);
      dispatch(setError(err.response?.data?.message || 'Failed to load users'));
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, pagination.currentPage, pagination.pageSize, filters]);

  // Fetch users on mount and when dependencies change
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  /**
   * Handle page change
   */
  const handlePageChange = (newPage) => {
    dispatch(setPagination({ currentPage: newPage }));
  };

  /**
   * Handle search input change
   */
  const handleSearchChange = (e) => {
    dispatch(setFilters({ search: e.target.value }));
  };

  /**
   * Handle status filter change
   */
  const handleStatusFilterChange = (e) => {
    dispatch(setFilters({ status: e.target.value || null }));
  };

  /**
   * Handle role filter change
   */
  const handleRoleFilterChange = (e) => {
    dispatch(setFilters({ role: e.target.value || null }));
  };

  /**
   * Handle create new user
   */
  const handleCreateUser = () => {
    setEditingUser(null);
    setShowUserModal(true);
  };

  /**
   * Handle edit user
   */
  const handleEditUser = (user) => {
    setEditingUser(user);
    setShowUserModal(true);
  };

  /**
   * Handle user form success
   */
  const handleUserFormSuccess = () => {
    setShowUserModal(false);
    setEditingUser(null);
    // Refresh user list
    fetchUsers();
  };

  /**
   * Handle delete user
   */
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      await usersApi.deleteUser(userId);
      // Refresh user list
      fetchUsers();
    } catch (err) {
      console.error('Failed to delete user:', err);
      dispatch(
        setError(err.response?.data?.message || 'Failed to delete user')
      );
    }
  };

  return (
    <Container fluid>
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <h1 className="h3 mb-0">User Management</h1>
          <p className="text-muted">Manage system users and their roles</p>
        </Col>
        <Col xs="auto" className="d-flex align-items-center">
          {/* Create User Button */}
          <Button
            variant="primary"
            onClick={handleCreateUser}
            className="d-flex align-items-center gap-2"
          >
            <PersonPlus />
            <span className="d-none d-md-inline">Create User</span>
          </Button>
        </Col>
      </Row>

      {/* Filters */}
      <Row className="mb-4">
        <Col md={4}>
          {/* Search */}
          <InputGroup>
            <InputGroup.Text>
              <Search />
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Search by username or email..."
              value={filters.search}
              onChange={handleSearchChange}
            />
          </InputGroup>
        </Col>
        <Col md={3}>
          {/* Status Filter */}
          <Form.Select
            value={filters.status || ''}
            onChange={handleStatusFilterChange}
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="locked">Locked</option>
          </Form.Select>
        </Col>
        <Col md={3}>
          {/* Role Filter */}
          <Form.Select
            value={filters.role || ''}
            onChange={handleRoleFilterChange}
          >
            <option value="">All Roles</option>
            <option value="ROLE_ADMIN">Admin</option>
            <option value="ROLE_USER">User</option>
            <option value="ROLE_VIEWER">Viewer</option>
          </Form.Select>
        </Col>
      </Row>

      {/* Error Alert */}
      {error && (
        <Alert
          variant="danger"
          dismissible
          onClose={() => dispatch(clearError())}
        >
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-5">
          <Spinner animation="border" role="status" variant="primary">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-3 text-muted">Loading users...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && users.length === 0 && (
        <EmptyState
          icon={<PersonPlus size={48} />}
          title="No users found"
          message={
            filters.search || filters.status || filters.role
              ? 'Try adjusting your filters or search criteria'
              : 'Get started by creating your first user'
          }
          action={
            <Button variant="primary" onClick={handleCreateUser}>
              <PersonPlus className="me-2" />
              Create User
            </Button>
          }
        />
      )}

      {/* Users Table */}
      {!loading && users.length > 0 && (
        <>
          <UserTable
            users={users}
            onEdit={handleEditUser}
            onDelete={handleDeleteUser}
            onRefresh={fetchUsers}
          />

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <Row className="mt-4">
              <Col className="d-flex justify-content-center">
                <Pagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                  totalItems={pagination.totalItems}
                  pageSize={pagination.pageSize}
                />
              </Col>
            </Row>
          )}
        </>
      )}

      {/* User Form Modal */}
      <UserForm
        show={showUserModal}
        onHide={() => setShowUserModal(false)}
        user={editingUser}
        onSuccess={handleUserFormSuccess}
      />
    </Container>
  );
};

export default UserManagementPage;
