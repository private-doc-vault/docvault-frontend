import React from 'react';
import { Card, Badge, Row, Col, Placeholder } from 'react-bootstrap';
import {
  CheckCircleFill,
  XCircleFill,
  ExclamationTriangleFill,
  QuestionCircleFill,
} from 'react-bootstrap-icons';

/**
 * SystemHealthStatus component displays overall system health and individual service statuses
 * @param {Object} props
 * @param {Object} props.systemHealth - System health data
 * @param {string} props.systemHealth.status - Overall status (healthy, degraded, down, unknown)
 * @param {Object} props.systemHealth.services - Individual service statuses
 * @param {string} props.systemHealth.lastChecked - Last check timestamp
 * @param {boolean} props.loading - Show loading state
 */
const SystemHealthStatus = ({ systemHealth, loading = false }) => {
  const { status, services, lastChecked } = systemHealth || {};

  /**
   * Get overall status badge
   */
  const getStatusBadge = () => {
    if (loading) {
      return (
        <Placeholder as="span" animation="glow">
          <Placeholder xs={3} />
        </Placeholder>
      );
    }

    switch (status) {
      case 'healthy':
        return (
          <Badge bg="success" className="d-flex align-items-center gap-2">
            <CheckCircleFill size={16} />
            <span>All Systems Operational</span>
          </Badge>
        );
      case 'degraded':
        return (
          <Badge
            bg="warning"
            text="dark"
            className="d-flex align-items-center gap-2"
          >
            <ExclamationTriangleFill size={16} />
            <span>Degraded Performance</span>
          </Badge>
        );
      case 'down':
        return (
          <Badge bg="danger" className="d-flex align-items-center gap-2">
            <XCircleFill size={16} />
            <span>Service Issues</span>
          </Badge>
        );
      default:
        return (
          <Badge bg="secondary" className="d-flex align-items-center gap-2">
            <QuestionCircleFill size={16} />
            <span>Status Unknown</span>
          </Badge>
        );
    }
  };

  /**
   * Get service status icon and color
   */
  const getServiceStatus = (serviceStatus) => {
    switch (serviceStatus) {
      case 'healthy':
      case 'up':
      case 'connected':
        return {
          icon: <CheckCircleFill size={20} />,
          color: 'text-success',
          label: 'Healthy',
        };
      case 'degraded':
      case 'slow':
        return {
          icon: <ExclamationTriangleFill size={20} />,
          color: 'text-warning',
          label: 'Degraded',
        };
      case 'down':
      case 'disconnected':
      case 'error':
        return {
          icon: <XCircleFill size={20} />,
          color: 'text-danger',
          label: 'Down',
        };
      default:
        return {
          icon: <QuestionCircleFill size={20} />,
          color: 'text-secondary',
          label: 'Unknown',
        };
    }
  };

  /**
   * Render individual service status
   */
  const renderServiceStatus = (serviceName, serviceData) => {
    if (loading) {
      return (
        <Col xs={12} sm={6} md={4} lg={2} key={serviceName} className="mb-3">
          <Placeholder as="div" animation="glow">
            <Placeholder xs={12} />
          </Placeholder>
        </Col>
      );
    }

    const { icon, color, label } = getServiceStatus(serviceData?.status);
    const displayName = serviceName
      .split(/(?=[A-Z])/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    return (
      <Col xs={12} sm={6} md={4} lg={2} key={serviceName} className="mb-3">
        <div className="d-flex flex-column align-items-center text-center">
          <div className={color} title={serviceData?.message || label}>
            {icon}
          </div>
          <small className="mt-1 fw-medium">{displayName}</small>
          <small className="text-muted" style={{ fontSize: '0.7rem' }}>
            {label}
          </small>
          {serviceData?.message && (
            <small className="text-muted mt-1" style={{ fontSize: '0.65rem' }}>
              {serviceData.message}
            </small>
          )}
        </div>
      </Col>
    );
  };

  return (
    <Card>
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h5 className="mb-0">System Health</h5>
        <div className="d-flex align-items-center gap-3">
          {getStatusBadge()}
        </div>
      </Card.Header>
      <Card.Body>
        {lastChecked && !loading && (
          <div className="mb-3">
            <small className="text-muted">
              Last checked: {new Date(lastChecked).toLocaleString()}
            </small>
          </div>
        )}

        <Row>
          {services && Object.keys(services).length > 0 ? (
            Object.entries(services).map(([serviceName, serviceData]) =>
              renderServiceStatus(serviceName, serviceData)
            )
          ) : loading ? (
            // Loading placeholders
            <>
              {[1, 2, 3, 4, 5].map((i) => (
                <Col xs={12} sm={6} md={4} lg={2} key={i} className="mb-3">
                  <Placeholder as="div" animation="glow">
                    <div className="text-center">
                      <Placeholder.Button xs={4} aria-hidden="true" />
                      <div className="mt-1">
                        <Placeholder xs={8} size="sm" />
                      </div>
                    </div>
                  </Placeholder>
                </Col>
              ))}
            </>
          ) : (
            <Col>
              <p className="text-muted text-center mb-0">
                No service data available
              </p>
            </Col>
          )}
        </Row>
      </Card.Body>
    </Card>
  );
};

export default SystemHealthStatus;
