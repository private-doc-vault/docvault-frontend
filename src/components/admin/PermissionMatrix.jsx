import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import { Table, Form } from 'react-bootstrap';
import { toggleRolePermission } from '../../features/roles/rolesSlice';

/**
 * PermissionMatrix - Displays a grid of roles vs permissions with checkboxes
 * Allows toggling permission assignments for each role
 */
const PermissionMatrix = ({ roles, permissions, rolePermissions }) => {
  const dispatch = useDispatch();

  /**
   * Check if a role has a specific permission
   */
  const hasPermission = (roleId, permissionId) => {
    const rolePerms = rolePermissions[roleId] || [];
    return rolePerms.includes(permissionId);
  };

  /**
   * Handle checkbox toggle
   */
  const handleToggle = (roleId, permissionId) => {
    dispatch(toggleRolePermission({ roleId, permissionId }));
  };

  /**
   * Get role identifier (id or name)
   */
  const getRoleId = (role) => role.id || role.name;

  /**
   * Get permission identifier (id or name)
   */
  const getPermissionId = (perm) => perm.id || perm.name;

  return (
    <div className="table-responsive">
      <Table bordered hover className="permission-matrix">
        <thead className="table-light">
          <tr>
            <th
              style={{
                width: '200px',
                position: 'sticky',
                left: 0,
                backgroundColor: '#f8f9fa',
                zIndex: 2,
              }}
            >
              Role / Permission
            </th>
            {permissions.map((permission) => (
              <th
                key={getPermissionId(permission)}
                className="text-center"
                style={{ minWidth: '120px' }}
              >
                <div className="d-flex flex-column align-items-center">
                  <strong className="mb-1">{permission.name}</strong>
                  {permission.description && (
                    <small className="text-muted text-center">
                      {permission.description}
                    </small>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {roles.map((role) => {
            const roleId = getRoleId(role);
            return (
              <tr key={roleId}>
                <td
                  style={{
                    position: 'sticky',
                    left: 0,
                    backgroundColor: '#fff',
                    zIndex: 1,
                    fontWeight: 500,
                  }}
                >
                  <div className="d-flex flex-column">
                    <strong>{role.name}</strong>
                    {role.description && (
                      <small className="text-muted">{role.description}</small>
                    )}
                  </div>
                </td>
                {permissions.map((permission) => {
                  const permissionId = getPermissionId(permission);
                  const isChecked = hasPermission(roleId, permissionId);

                  return (
                    <td key={permissionId} className="text-center align-middle">
                      <Form.Check
                        type="checkbox"
                        id={`role-${roleId}-perm-${permissionId}`}
                        checked={isChecked}
                        onChange={() => handleToggle(roleId, permissionId)}
                        className="d-flex justify-content-center"
                        style={{ cursor: 'pointer' }}
                      />
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </Table>

      <style>{`
        .permission-matrix {
          margin-bottom: 0;
        }

        .permission-matrix th {
          vertical-align: middle;
        }

        .permission-matrix .form-check-input {
          cursor: pointer;
          width: 1.2rem;
          height: 1.2rem;
        }

        .permission-matrix tbody tr:hover {
          background-color: #f8f9fa;
        }

        .permission-matrix tbody td:first-child {
          box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
        }

        @media (max-width: 768px) {
          .permission-matrix th,
          .permission-matrix td {
            font-size: 0.85rem;
            padding: 0.5rem;
          }

          .permission-matrix .form-check-input {
            width: 1rem;
            height: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

PermissionMatrix.propTypes = {
  roles: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      name: PropTypes.string.isRequired,
      description: PropTypes.string,
    })
  ).isRequired,
  permissions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      name: PropTypes.string.isRequired,
      description: PropTypes.string,
    })
  ).isRequired,
  rolePermissions: PropTypes.objectOf(
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number]))
  ).isRequired,
};

export default PermissionMatrix;
