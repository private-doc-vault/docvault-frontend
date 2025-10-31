import PropTypes from 'prop-types';
import { Badge } from 'react-bootstrap';

/**
 * Get badge variant based on user status
 */
const getStatusVariant = (status) => {
  switch (status?.toLowerCase()) {
    case 'active':
      return 'success';
    case 'inactive':
      return 'secondary';
    case 'locked':
      return 'danger';
    default:
      return 'secondary';
  }
};

/**
 * Format status name for display
 */
const formatStatusName = (status) => {
  if (!status) return 'Unknown';
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
};

/**
 * UserStatusBadge - Badge component for displaying user status
 */
const UserStatusBadge = ({ status }) => {
  return (
    <Badge bg={getStatusVariant(status)}>
      {formatStatusName(status)}
    </Badge>
  );
};

UserStatusBadge.propTypes = {
  status: PropTypes.string,
};

export default UserStatusBadge;
