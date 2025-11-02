import React from 'react';
import { ProgressBar } from 'react-bootstrap';
import PropTypes from 'prop-types';

/**
 * OcrProgressBar Component
 *
 * Displays OCR processing progress with a visual progress bar
 *
 * Features:
 * - Animated progress bar
 * - Color coding based on status
 * - Percentage display
 * - Optional size variants
 */
const OcrProgressBar = ({
  progress = 0,
  status = 'processing',
  showLabel = true,
  animated = true,
  size = 'default',
  className = '',
}) => {
  // Ensure progress is between 0 and 100
  const normalizedProgress = Math.max(0, Math.min(100, progress));

  // Map status to Bootstrap progress bar variant
  const getVariant = () => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'failed':
        return 'danger';
      case 'processing':
        return 'primary';
      case 'pending':
        return 'secondary';
      default:
        return 'info';
    }
  };

  // Determine if progress bar should be animated
  const isAnimated =
    animated && (status === 'processing' || status === 'pending');

  // Size classes for different variants
  const sizeClass =
    {
      small: 'progress-sm',
      default: '',
      large: 'progress-lg',
    }[size] || '';

  return (
    <div className={`ocr-progress-container ${className}`}>
      <ProgressBar
        now={normalizedProgress}
        variant={getVariant()}
        animated={isAnimated}
        striped={isAnimated}
        label={showLabel ? `${normalizedProgress}%` : undefined}
        className={sizeClass}
        title={`OCR Processing: ${normalizedProgress}%`}
      />
      {status === 'processing' && (
        <small className="text-muted d-block mt-1">
          Processing... {normalizedProgress}%
        </small>
      )}
      {status === 'failed' && (
        <small className="text-danger d-block mt-1">Processing failed</small>
      )}
      {status === 'completed' && (
        <small className="text-success d-block mt-1">Processing complete</small>
      )}
    </div>
  );
};

OcrProgressBar.propTypes = {
  progress: PropTypes.number,
  status: PropTypes.oneOf(['pending', 'processing', 'completed', 'failed']),
  showLabel: PropTypes.bool,
  animated: PropTypes.bool,
  size: PropTypes.oneOf(['small', 'default', 'large']),
  className: PropTypes.string,
};

export default OcrProgressBar;
