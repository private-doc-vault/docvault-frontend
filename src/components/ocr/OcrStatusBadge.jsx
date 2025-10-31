import React from 'react';
import { Badge } from 'react-bootstrap';
import PropTypes from 'prop-types';

/**
 * OcrStatusBadge Component
 *
 * Displays the OCR processing status with appropriate colors and labels
 *
 * Status values and their meanings:
 * - pending: Document uploaded, waiting to start OCR
 * - processing: OCR is currently in progress
 * - completed: OCR processing finished successfully
 * - failed: OCR processing encountered an error
 */
const OcrStatusBadge = ({ status, className = '' }) => {
  // Map status to Bootstrap badge variant and display text
  const statusConfig = {
    pending: {
      variant: 'secondary',
      label: 'Pending',
      icon: '⏳',
    },
    processing: {
      variant: 'primary',
      label: 'Processing',
      icon: '⚙️',
    },
    completed: {
      variant: 'success',
      label: 'Completed',
      icon: '✓',
    },
    failed: {
      variant: 'danger',
      label: 'Failed',
      icon: '✗',
    },
    cancelled: {
      variant: 'warning',
      label: 'Cancelled',
      icon: '⊘',
    },
  };

  // Default to secondary if status is unknown
  const config = statusConfig[status] || {
    variant: 'secondary',
    label: status || 'Unknown',
    icon: '?',
  };

  return (
    <Badge
      bg={config.variant}
      className={`ocr-status-badge ${className}`}
      title={`OCR Status: ${config.label}`}
    >
      <span className="badge-icon" role="img" aria-label={config.label}>
        {config.icon}
      </span>{' '}
      {config.label}
    </Badge>
  );
};

OcrStatusBadge.propTypes = {
  status: PropTypes.oneOf([
    'pending',
    'processing',
    'completed',
    'failed',
    'cancelled',
  ]).isRequired,
  className: PropTypes.string,
};

export default OcrStatusBadge;
