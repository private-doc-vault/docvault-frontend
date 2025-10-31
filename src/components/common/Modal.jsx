import BootstrapModal from 'react-bootstrap/Modal';
import Button from './Button';
import PropTypes from 'prop-types';

/**
 * Modal - Custom modal component wrapper
 *
 * Wraps React-Bootstrap Modal with consistent styling and common patterns
 *
 * @param {boolean} show - Control modal visibility
 * @param {function} onHide - Handler called when modal should close
 * @param {string} title - Modal title
 * @param {ReactNode} children - Modal body content
 * @param {string} size - Modal size (sm, lg, xl)
 * @param {boolean} centered - Center modal vertically
 * @param {boolean} scrollable - Make modal body scrollable
 * @param {string} headerClassName - Additional header CSS classes
 * @param {string} bodyClassName - Additional body CSS classes
 * @param {string} footerClassName - Additional footer CSS classes
 * @param {ReactNode} footer - Custom footer content (overrides default buttons)
 * @param {boolean} showCloseButton - Show X close button in header
 * @param {boolean} backdrop - Enable backdrop ('static' prevents closing on click)
 * @param {boolean} keyboard - Close modal on ESC key
 * @param {string} confirmText - Text for confirm button
 * @param {string} cancelText - Text for cancel button
 * @param {function} onConfirm - Handler for confirm button click
 * @param {function} onCancel - Handler for cancel button click
 * @param {string} confirmVariant - Bootstrap variant for confirm button
 * @param {boolean} loading - Show loading state on confirm button
 * @param {boolean} hideFooter - Hide the footer completely
 */
const Modal = ({
  show,
  onHide,
  title,
  children,
  size,
  centered = true,
  scrollable = false,
  headerClassName = '',
  bodyClassName = '',
  footerClassName = '',
  footer = null,
  showCloseButton = true,
  backdrop = true,
  keyboard = true,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm = null,
  onCancel = null,
  confirmVariant = 'primary',
  loading = false,
  hideFooter = false,
  ...props
}) => {
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    onHide();
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
  };

  const renderFooter = () => {
    if (hideFooter) {
      return null;
    }

    if (footer) {
      return <BootstrapModal.Footer className={footerClassName}>{footer}</BootstrapModal.Footer>;
    }

    // Default footer with cancel and confirm buttons
    if (onConfirm) {
      return (
        <BootstrapModal.Footer className={footerClassName}>
          <Button variant="secondary" onClick={handleCancel} disabled={loading}>
            {cancelText}
          </Button>
          <Button variant={confirmVariant} onClick={handleConfirm} loading={loading}>
            {confirmText}
          </Button>
        </BootstrapModal.Footer>
      );
    }

    // Just close button if no confirm handler
    return (
      <BootstrapModal.Footer className={footerClassName}>
        <Button variant="secondary" onClick={handleCancel}>
          Close
        </Button>
      </BootstrapModal.Footer>
    );
  };

  return (
    <BootstrapModal
      show={show}
      onHide={onHide}
      size={size}
      centered={centered}
      scrollable={scrollable}
      backdrop={backdrop}
      keyboard={keyboard}
      {...props}
    >
      <BootstrapModal.Header closeButton={showCloseButton} className={headerClassName}>
        <BootstrapModal.Title>{title}</BootstrapModal.Title>
      </BootstrapModal.Header>

      <BootstrapModal.Body className={bodyClassName}>{children}</BootstrapModal.Body>

      {renderFooter()}
    </BootstrapModal>
  );
};

Modal.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  size: PropTypes.oneOf(['sm', 'lg', 'xl']),
  centered: PropTypes.bool,
  scrollable: PropTypes.bool,
  headerClassName: PropTypes.string,
  bodyClassName: PropTypes.string,
  footerClassName: PropTypes.string,
  footer: PropTypes.node,
  showCloseButton: PropTypes.bool,
  backdrop: PropTypes.oneOfType([PropTypes.bool, PropTypes.oneOf(['static'])]),
  keyboard: PropTypes.bool,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
  onConfirm: PropTypes.func,
  onCancel: PropTypes.func,
  confirmVariant: PropTypes.string,
  loading: PropTypes.bool,
  hideFooter: PropTypes.bool,
};

export default Modal;
