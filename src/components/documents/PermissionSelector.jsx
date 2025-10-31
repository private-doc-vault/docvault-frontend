import PropTypes from 'prop-types';
import { Form } from 'react-bootstrap';

/**
 * Available permission levels
 */
const PERMISSION_LEVELS = [
  {
    value: 'read',
    label: 'Read',
    description: 'Can view the document',
    permissions: ['read'],
  },
  {
    value: 'write',
    label: 'Read & Write',
    description: 'Can view and edit the document',
    permissions: ['read', 'write'],
  },
  {
    value: 'full',
    label: 'Full Access',
    description: 'Can view, edit, and delete the document',
    permissions: ['read', 'write', 'delete'],
  },
];

/**
 * PermissionSelector - Dropdown for selecting share permissions
 */
const PermissionSelector = ({ value, onChange, disabled = false, size = 'md' }) => {
  /**
   * Get permission level value from permissions array
   */
  const getPermissionLevel = (permissions) => {
    if (!permissions || permissions.length === 0) return 'read';

    const permSet = new Set(permissions);

    if (permSet.has('delete') && permSet.has('write') && permSet.has('read')) {
      return 'full';
    } else if (permSet.has('write') && permSet.has('read')) {
      return 'write';
    } else {
      return 'read';
    }
  };

  /**
   * Handle selection change
   */
  const handleChange = (e) => {
    const level = e.target.value;
    const permissionObj = PERMISSION_LEVELS.find((p) => p.value === level);

    if (permissionObj && onChange) {
      onChange(permissionObj.permissions);
    }
  };

  const currentLevel = getPermissionLevel(value);

  return (
    <Form.Select
      value={currentLevel}
      onChange={handleChange}
      disabled={disabled}
      size={size}
    >
      {PERMISSION_LEVELS.map((level) => (
        <option key={level.value} value={level.value}>
          {level.label}
        </option>
      ))}
    </Form.Select>
  );
};

PermissionSelector.propTypes = {
  value: PropTypes.arrayOf(PropTypes.string),
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
};

export default PermissionSelector;
export { PERMISSION_LEVELS };
