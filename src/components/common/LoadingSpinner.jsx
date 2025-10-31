import React from 'react';
import { Spinner } from 'react-bootstrap';

/**
 * LoadingSpinner component displays a loading indicator
 * @param {Object} props
 * @param {string} props.size - Spinner size: 'sm' or default
 * @param {string} props.variant - Bootstrap color variant
 * @param {string} props.message - Optional loading message
 * @param {boolean} props.center - Center the spinner (default: true)
 */
const LoadingSpinner = ({ size, variant = 'primary', message, center = true }) => {
  const spinnerElement = (
    <>
      <Spinner
        animation="border"
        role="status"
        variant={variant}
        size={size}
        data-testid="loading-spinner"
      >
        <span className="visually-hidden">Loading...</span>
      </Spinner>
      {message && <div className="mt-2 text-muted">{message}</div>}
    </>
  );

  if (center) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center py-5">
        {spinnerElement}
      </div>
    );
  }

  return spinnerElement;
};

export default LoadingSpinner;
