import React, { useState, useEffect } from 'react';
import { Row, Col, Form, Button } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { format } from 'date-fns';

/**
 * AuditLogFilters Component
 * Provides filters for audit logs: date range, user, action, document
 */
const AuditLogFilters = ({ filters, onFilterChange, onReset }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleInputChange = (field, value) => {
    setLocalFilters({
      ...localFilters,
      [field]: value || null,
    });
  };

  const handleApply = (e) => {
    e.preventDefault();
    onFilterChange(localFilters);
  };

  const handleReset = () => {
    const emptyFilters = {
      documentId: null,
      userId: null,
      action: null,
      startDate: null,
      endDate: null,
    };
    setLocalFilters(emptyFilters);
    onReset();
  };

  // Common action types
  const actionTypes = [
    { value: '', label: 'All Actions' },
    { value: 'create', label: 'Create' },
    { value: 'update', label: 'Update' },
    { value: 'delete', label: 'Delete' },
    { value: 'view', label: 'View' },
    { value: 'share', label: 'Share' },
    { value: 'download', label: 'Download' },
    { value: 'login', label: 'Login' },
    { value: 'logout', label: 'Logout' },
  ];

  // Format date for input (YYYY-MM-DD)
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return format(date, 'yyyy-MM-dd');
    } catch (err) {
      return '';
    }
  };

  return (
    <Form onSubmit={handleApply}>
      <Row className="g-3">
        <Col md={6} lg={3}>
          <Form.Group controlId="startDate">
            <Form.Label>Start Date</Form.Label>
            <Form.Control
              type="date"
              value={formatDateForInput(localFilters.startDate)}
              onChange={(e) => handleInputChange('startDate', e.target.value)}
              max={localFilters.endDate ? formatDateForInput(localFilters.endDate) : undefined}
            />
          </Form.Group>
        </Col>

        <Col md={6} lg={3}>
          <Form.Group controlId="endDate">
            <Form.Label>End Date</Form.Label>
            <Form.Control
              type="date"
              value={formatDateForInput(localFilters.endDate)}
              onChange={(e) => handleInputChange('endDate', e.target.value)}
              min={localFilters.startDate ? formatDateForInput(localFilters.startDate) : undefined}
            />
          </Form.Group>
        </Col>

        <Col md={6} lg={2}>
          <Form.Group controlId="userId">
            <Form.Label>User ID</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter user ID"
              value={localFilters.userId || ''}
              onChange={(e) => handleInputChange('userId', e.target.value)}
            />
          </Form.Group>
        </Col>

        <Col md={6} lg={2}>
          <Form.Group controlId="action">
            <Form.Label>Action</Form.Label>
            <Form.Select
              value={localFilters.action || ''}
              onChange={(e) => handleInputChange('action', e.target.value)}
            >
              {actionTypes.map((action) => (
                <option key={action.value} value={action.value}>
                  {action.label}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>

        <Col md={6} lg={2}>
          <Form.Group controlId="documentId">
            <Form.Label>Document ID</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter document ID"
              value={localFilters.documentId || ''}
              onChange={(e) => handleInputChange('documentId', e.target.value)}
            />
          </Form.Group>
        </Col>
      </Row>

      <Row className="mt-3">
        <Col className="d-flex gap-2">
          <Button type="submit" variant="primary">
            <i className="bi bi-funnel me-2"></i>
            Apply Filters
          </Button>
          <Button type="button" variant="outline-secondary" onClick={handleReset}>
            <i className="bi bi-x-circle me-2"></i>
            Reset
          </Button>
        </Col>
      </Row>
    </Form>
  );
};

AuditLogFilters.propTypes = {
  filters: PropTypes.shape({
    documentId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    action: PropTypes.string,
    startDate: PropTypes.string,
    endDate: PropTypes.string,
  }).isRequired,
  onFilterChange: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired,
};

export default AuditLogFilters;
