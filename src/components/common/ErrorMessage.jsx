import Alert from 'react-bootstrap/Alert';
import { ExclamationTriangleFill, XCircleFill } from 'react-bootstrap-icons';
import PropTypes from 'prop-types';

/**
 * ErrorMessage - Error display component
 *
 * Displays error messages in a consistent, user-friendly format
 *
 * @param {string|Error|Object} error - Error to display (string, Error object, or API error)
 * @param {string} variant - Bootstrap alert variant (default: 'danger')
 * @param {boolean} dismissible - Allow user to dismiss the error
 * @param {function} onClose - Handler called when error is dismissed
 * @param {string} title - Optional error title/heading
 * @param {boolean} showIcon - Show icon next to error message
 * @param {string} className - Additional CSS classes
 */
const ErrorMessage = ({
  error,
  variant = 'danger',
  dismissible = false,
  onClose,
  title = 'Error',
  showIcon = true,
  className = '',
}) => {
  if (!error) {
    return null;
  }

  // Extract error message from different error formats
  const getErrorMessage = () => {
    if (typeof error === 'string') {
      return error;
    }

    if (error instanceof Error) {
      return error.message;
    }

    // Handle API error responses
    if (error.response?.data?.message) {
      return error.response.data.message;
    }

    if (error.response?.data?.error) {
      return error.response.data.error;
    }

    if (error.message) {
      return error.message;
    }

    // Handle validation errors
    if (error.response?.data?.errors) {
      const errors = error.response.data.errors;
      if (Array.isArray(errors)) {
        return errors.join(', ');
      }
      if (typeof errors === 'object') {
        return Object.values(errors).flat().join(', ');
      }
    }

    return 'An unexpected error occurred. Please try again.';
  };

  const errorMessage = getErrorMessage();

  // Choose icon based on variant
  const getIcon = () => {
    if (variant === 'warning') {
      return <ExclamationTriangleFill className="me-2" />;
    }
    return <XCircleFill className="me-2" />;
  };

  return (
    <Alert
      variant={variant}
      dismissible={dismissible}
      onClose={onClose}
      className={className}
    >
      {title && <Alert.Heading className="h6">
        {showIcon && getIcon()}
        {title}
      </Alert.Heading>}
      <div className={title ? 'mt-2' : ''}>
        {!title && showIcon && getIcon()}
        {errorMessage}
      </div>
    </Alert>
  );
};

ErrorMessage.propTypes = {
  error: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object,
    PropTypes.instanceOf(Error),
  ]),
  variant: PropTypes.oneOf(['danger', 'warning', 'info']),
  dismissible: PropTypes.bool,
  onClose: PropTypes.func,
  title: PropTypes.string,
  showIcon: PropTypes.bool,
  className: PropTypes.string,
};

export default ErrorMessage;
