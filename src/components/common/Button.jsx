import BootstrapButton from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import PropTypes from 'prop-types';

/**
 * Button - Custom button component wrapper
 *
 * Wraps React-Bootstrap Button with consistent styling and loading state
 *
 * @param {boolean} loading - Show loading spinner and disable button
 * @param {ReactNode} children - Button content
 * @param {boolean} disabled - Disable button
 * @param {string} variant - Bootstrap button variant
 * @param {string} size - Button size (sm, lg)
 * @param {string} type - Button type (button, submit, reset)
 * @param {function} onClick - Click handler
 * @param {string} className - Additional CSS classes
 * @param {ReactNode} icon - Optional icon to display before text
 * @param {boolean} fullWidth - Make button full width
 */
const Button = ({
  loading = false,
  children,
  disabled = false,
  variant = 'primary',
  size,
  type = 'button',
  onClick,
  className = '',
  icon = null,
  fullWidth = false,
  ...props
}) => {
  const isDisabled = disabled || loading;
  const buttonClasses = `${className} ${fullWidth ? 'w-100' : ''}`.trim();

  return (
    <BootstrapButton
      variant={variant}
      size={size}
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      className={buttonClasses}
      {...props}
    >
      {loading ? (
        <>
          <Spinner
            as="span"
            animation="border"
            size="sm"
            role="status"
            aria-hidden="true"
            className="me-2"
          />
          {typeof children === 'string' ? 'Loading...' : children}
        </>
      ) : (
        <>
          {icon && <span className="me-2">{icon}</span>}
          {children}
        </>
      )}
    </BootstrapButton>
  );
};

Button.propTypes = {
  loading: PropTypes.bool,
  children: PropTypes.node.isRequired,
  disabled: PropTypes.bool,
  variant: PropTypes.oneOf([
    'primary',
    'secondary',
    'success',
    'danger',
    'warning',
    'info',
    'light',
    'dark',
    'link',
    'outline-primary',
    'outline-secondary',
    'outline-success',
    'outline-danger',
    'outline-warning',
    'outline-info',
    'outline-light',
    'outline-dark',
  ]),
  size: PropTypes.oneOf(['sm', 'lg']),
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  onClick: PropTypes.func,
  className: PropTypes.string,
  icon: PropTypes.node,
  fullWidth: PropTypes.bool,
};

export default Button;
