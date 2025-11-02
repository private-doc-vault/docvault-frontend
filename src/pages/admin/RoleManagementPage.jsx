import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Row,
  Col,
  Button,
  Alert,
  Spinner,
  Card,
} from 'react-bootstrap';
import { Save, XCircle } from 'react-bootstrap-icons';
import {
  selectRoles,
  selectPermissions,
  selectRolePermissions,
  selectHasUnsavedChanges,
  selectRolesLoading,
  selectRolesError,
  setRoles,
  setPermissions,
  setRolePermissions,
  setLoading,
  setError,
  clearError,
  markChangesSaved,
  discardChanges,
} from '../../features/roles/rolesSlice';
import rolesApi from '../../api/rolesApi';
import PermissionMatrix from '../../components/admin/PermissionMatrix';

/**
 * RoleManagementPage - Admin page for managing role permissions
 * Displays a permission matrix and allows updating role-permission assignments
 * This page is protected and requires ROLE_ADMIN
 */
const RoleManagementPage = () => {
  const dispatch = useDispatch();
  const roles = useSelector(selectRoles);
  const permissions = useSelector(selectPermissions);
  const rolePermissions = useSelector(selectRolePermissions);
  const hasUnsavedChanges = useSelector(selectHasUnsavedChanges);
  const loading = useSelector(selectRolesLoading);
  const error = useSelector(selectRolesError);

  // Local state
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  /**
   * Fetch roles and permissions from API
   */
  const fetchData = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      dispatch(clearError());

      // Fetch roles, permissions, and role-permission mappings in parallel
      const [rolesData, permissionsData, rolePermissionsData] = await Promise.all([
        rolesApi.fetchRoles(),
        rolesApi.fetchPermissions(),
        rolesApi.fetchRolePermissions(),
      ]);

      // Update Redux state
      dispatch(setRoles(rolesData.roles || rolesData || []));
      dispatch(setPermissions(permissionsData.permissions || permissionsData || []));
      dispatch(setRolePermissions(rolePermissionsData.rolePermissions || rolePermissionsData || {}));
    } catch (err) {
      console.error('Failed to fetch roles and permissions:', err);
      dispatch(setError(err.response?.data?.message || 'Failed to load roles and permissions'));
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  // Fetch data on mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /**
   * Handle save button click
   */
  const handleSave = async () => {
    try {
      setSaving(true);
      setSaveSuccess(false);
      dispatch(clearError());

      // Send updated role-permissions to backend
      await rolesApi.batchUpdateRolePermissions(rolePermissions);

      // Mark changes as saved
      dispatch(markChangesSaved());
      setSaveSuccess(true);

      // Hide success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Failed to save role permissions:', err);
      dispatch(setError(err.response?.data?.message || 'Failed to save changes'));
    } finally {
      setSaving(false);
    }
  };

  /**
   * Handle discard changes
   */
  const handleDiscard = () => {
    if (window.confirm('Are you sure you want to discard all unsaved changes?')) {
      dispatch(discardChanges());
      // Refetch data to restore original state
      fetchData();
    }
  };

  return (
    <Container fluid>
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <h1 className="h3 mb-0">Role & Permission Management</h1>
          <p className="text-muted">
            Manage role-permission assignments for system access control
          </p>
        </Col>
        <Col xs="auto" className="d-flex align-items-center gap-2">
          {/* Discard Button */}
          {hasUnsavedChanges && (
            <Button
              variant="outline-secondary"
              onClick={handleDiscard}
              disabled={saving}
              className="d-flex align-items-center gap-2"
            >
              <XCircle />
              <span className="d-none d-md-inline">Discard</span>
            </Button>
          )}

          {/* Save Button */}
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={!hasUnsavedChanges || saving}
            className="d-flex align-items-center gap-2"
          >
            {saving ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  className="me-1"
                />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save />
                <span className="d-none d-md-inline">Save Changes</span>
                <span className="d-md-none">Save</span>
              </>
            )}
          </Button>
        </Col>
      </Row>

      {/* Unsaved Changes Warning */}
      {hasUnsavedChanges && (
        <Alert variant="warning" className="mb-4">
          <strong>Unsaved Changes:</strong> You have unsaved changes to role permissions.
          Click &quot;Save Changes&quot; to persist your modifications.
        </Alert>
      )}

      {/* Success Alert */}
      {saveSuccess && (
        <Alert variant="success" dismissible onClose={() => setSaveSuccess(false)}>
          Changes saved successfully!
        </Alert>
      )}

      {/* Error Alert */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => dispatch(clearError())}>
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-5">
          <Spinner animation="border" role="status" variant="primary">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-3 text-muted">Loading roles and permissions...</p>
        </div>
      )}

      {/* Permission Matrix */}
      {!loading && roles.length > 0 && permissions.length > 0 && (
        <Card>
          <Card.Header>
            <Card.Title className="mb-0">Permission Matrix</Card.Title>
          </Card.Header>
          <Card.Body>
            <PermissionMatrix
              roles={roles}
              permissions={permissions}
              rolePermissions={rolePermissions}
            />
          </Card.Body>
        </Card>
      )}

      {/* Empty State */}
      {!loading && (roles.length === 0 || permissions.length === 0) && (
        <Alert variant="info">
          <Alert.Heading>No Data Available</Alert.Heading>
          <p>
            {roles.length === 0 && 'No roles found. '}
            {permissions.length === 0 && 'No permissions found. '}
            Please ensure the system has been properly configured with roles and permissions.
          </p>
        </Alert>
      )}

      {/* Additional Information */}
      {!loading && roles.length > 0 && permissions.length > 0 && (
        <Row className="mt-4">
          <Col md={6}>
            <Card className="mb-3">
              <Card.Header>
                <strong>Roles</strong>
              </Card.Header>
              <Card.Body>
                <ul className="mb-0">
                  {roles.map((role) => (
                    <li key={role.id || role.name}>
                      <strong>{role.name}</strong>
                      {role.description && (
                        <span className="text-muted"> - {role.description}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card className="mb-3">
              <Card.Header>
                <strong>Permissions</strong>
              </Card.Header>
              <Card.Body>
                <ul className="mb-0">
                  {permissions.map((perm) => (
                    <li key={perm.id || perm.name}>
                      <strong>{perm.name}</strong>
                      {perm.description && (
                        <span className="text-muted"> - {perm.description}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default RoleManagementPage;
