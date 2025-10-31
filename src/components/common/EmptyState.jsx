import PropTypes from 'prop-types';
import { Container } from 'react-bootstrap';

/**
 * EmptyState component
 * Displays a friendly empty state with icon, title, message, and optional action
 */
const EmptyState = ({
  icon,
  title,
  message,
  action,
  className = '',
  variant = 'default',
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'error':
        return {
          iconColor: 'text-danger',
          titleColor: 'text-danger',
        };
      case 'warning':
        return {
          iconColor: 'text-warning',
          titleColor: 'text-warning',
        };
      case 'info':
        return {
          iconColor: 'text-info',
          titleColor: 'text-dark',
        };
      default:
        return {
          iconColor: 'text-muted',
          titleColor: 'text-dark',
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <Container>
      <div
        className={`d-flex flex-column align-items-center justify-content-center text-center py-5 ${className}`}
        style={{ minHeight: '300px' }}
      >
        {/* Icon */}
        {icon && (
          <div className={`mb-3 ${styles.iconColor}`}>
            {icon}
          </div>
        )}

        {/* Title */}
        {title && (
          <h4 className={`mb-2 ${styles.titleColor}`}>
            {title}
          </h4>
        )}

        {/* Message */}
        {message && (
          <p className="text-muted mb-4" style={{ maxWidth: '400px' }}>
            {message}
          </p>
        )}

        {/* Action Button */}
        {action && (
          <div>
            {action}
          </div>
        )}
      </div>
    </Container>
  );
};

EmptyState.propTypes = {
  icon: PropTypes.node,
  title: PropTypes.string,
  message: PropTypes.string,
  action: PropTypes.node,
  className: PropTypes.string,
  variant: PropTypes.oneOf(['default', 'error', 'warning', 'info']),
};

export default EmptyState;
