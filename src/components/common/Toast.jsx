import BootstrapToast from 'react-bootstrap/Toast';
import ToastContainer from 'react-bootstrap/ToastContainer';
import {
  CheckCircleFill,
  ExclamationTriangleFill,
  InfoCircleFill,
  XCircleFill,
} from 'react-bootstrap-icons';
import PropTypes from 'prop-types';

/**
 * Toast - Toast notification component
 *
 * Displays toast notifications with different variants
 *
 * @param {string} id - Unique toast ID
 * @param {string} message - Toast message
 * @param {string} variant - Toast variant (success, error, warning, info)
 * @param {string} title - Optional toast title
 * @param {boolean} show - Control toast visibility
 * @param {function} onClose - Handler called when toast is closed
 * @param {number} delay - Auto-hide delay in milliseconds (default: 5000)
 * @param {boolean} autohide - Auto-hide toast after delay
 */
const Toast = ({
  message,
  variant = 'info',
  title,
  show = true,
  onClose,
  delay = 5000,
  autohide = true,
}) => {
  // Map variants to Bootstrap bg classes and icons
  const variantConfig = {
    success: {
      bg: 'success',
      icon: <CheckCircleFill className="me-2" />,
      defaultTitle: 'Success',
    },
    error: {
      bg: 'danger',
      icon: <XCircleFill className="me-2" />,
      defaultTitle: 'Error',
    },
    warning: {
      bg: 'warning',
      icon: <ExclamationTriangleFill className="me-2" />,
      defaultTitle: 'Warning',
    },
    info: {
      bg: 'info',
      icon: <InfoCircleFill className="me-2" />,
      defaultTitle: 'Info',
    },
  };

  const config = variantConfig[variant] || variantConfig.info;
  const toastTitle = title || config.defaultTitle;

  return (
    <BootstrapToast
      show={show}
      onClose={onClose}
      delay={delay}
      autohide={autohide}
      bg={config.bg}
      className="text-white"
    >
      <BootstrapToast.Header closeButton closeVariant="white">
        {config.icon}
        <strong className="me-auto">{toastTitle}</strong>
      </BootstrapToast.Header>
      <BootstrapToast.Body>{message}</BootstrapToast.Body>
    </BootstrapToast>
  );
};

Toast.propTypes = {
  id: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  variant: PropTypes.oneOf(['success', 'error', 'warning', 'info']),
  title: PropTypes.string,
  show: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  delay: PropTypes.number,
  autohide: PropTypes.bool,
};

/**
 * ToastNotificationContainer - Container for multiple toast notifications
 *
 * Positions toasts in the top-right corner of the screen
 *
 * @param {Array} toasts - Array of toast objects
 * @param {function} onRemoveToast - Handler to remove a toast
 */
export const ToastNotificationContainer = ({ toasts = [], onRemoveToast }) => {
  return (
    <ToastContainer position="top-end" className="p-3" style={{ zIndex: 9999 }}>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          message={toast.message}
          variant={toast.variant}
          title={toast.title}
          show={toast.show}
          onClose={() => onRemoveToast(toast.id)}
          delay={toast.delay}
          autohide={toast.autohide}
        />
      ))}
    </ToastContainer>
  );
};

ToastNotificationContainer.propTypes = {
  toasts: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      message: PropTypes.string.isRequired,
      variant: PropTypes.oneOf(['success', 'error', 'warning', 'info']),
      title: PropTypes.string,
      show: PropTypes.bool,
      delay: PropTypes.number,
      autohide: PropTypes.bool,
    })
  ),
  onRemoveToast: PropTypes.func.isRequired,
};

export default Toast;
