import React, { useState } from 'react';
import {
  Card,
  Badge,
  Row,
  Col,
  Table,
  Button,
  Alert,
  Placeholder,
} from 'react-bootstrap';
import {
  HourglassSplit,
  ArrowRepeat,
  XCircle,
  CheckCircle,
  ExclamationTriangle,
} from 'react-bootstrap-icons';
import { retryStuckTask, cancelTask } from '../../api/dashboardApi';
import { formatDate } from '../../utils/formatters';

/**
 * OcrQueueMonitor component displays OCR queue statistics and failed tasks
 * @param {Object} props
 * @param {Object} props.queueStatus - Queue status data
 * @param {number} props.queueStatus.pending - Number of pending tasks
 * @param {number} props.queueStatus.processing - Number of processing tasks
 * @param {number} props.queueStatus.failed - Number of failed tasks
 * @param {Array} props.queueStatus.failedTasks - Array of failed task details
 * @param {boolean} props.loading - Show loading state
 */
const OcrQueueMonitor = ({ queueStatus, loading = false }) => {
  const {
    pending = 0,
    processing = 0,
    failed = 0,
    failedTasks = [],
  } = queueStatus || {};
  const [retrying, setRetrying] = useState({});
  const [canceling, setCanceling] = useState({});
  const [actionError, setActionError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  /**
   * Handle retry of a failed task
   */
  const handleRetry = async (documentId) => {
    setRetrying({ ...retrying, [documentId]: true });
    setActionError(null);
    setActionSuccess(null);

    try {
      await retryStuckTask(documentId);
      setActionSuccess(`Successfully queued document ${documentId} for retry.`);

      // Optionally refresh the page data after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error(`Error retrying document ${documentId}:`, error);
      setActionError(
        error.response?.data?.message ||
          `Failed to retry document ${documentId}. Please try again.`
      );
    } finally {
      setRetrying({ ...retrying, [documentId]: false });
    }
  };

  /**
   * Handle cancel of a processing task
   */
  const handleCancel = async (documentId) => {
    if (!window.confirm('Are you sure you want to cancel this task?')) {
      return;
    }

    setCanceling({ ...canceling, [documentId]: true });
    setActionError(null);
    setActionSuccess(null);

    try {
      await cancelTask(documentId);
      setActionSuccess(
        `Successfully canceled task for document ${documentId}.`
      );

      // Optionally refresh the page data after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error(`Error canceling document ${documentId}:`, error);
      setActionError(
        error.response?.data?.message ||
          `Failed to cancel task for document ${documentId}. Please try again.`
      );
    } finally {
      setCanceling({ ...canceling, [documentId]: false });
    }
  };

  /**
   * Get queue health status
   */
  const getQueueHealthStatus = () => {
    if (failed > 10) {
      return { variant: 'danger', message: 'High failure rate detected' };
    }
    if (failed > 5) {
      return { variant: 'warning', message: 'Some tasks failing' };
    }
    if (pending > 100) {
      return { variant: 'warning', message: 'High queue backlog' };
    }
    return { variant: 'success', message: 'Queue operating normally' };
  };

  const queueHealth = getQueueHealthStatus();

  return (
    <Card>
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h5 className="mb-0">OCR Queue Monitor</h5>
        <Badge bg={queueHealth.variant}>{queueHealth.message}</Badge>
      </Card.Header>
      <Card.Body>
        {/* Queue Statistics */}
        <Row className="mb-4">
          <Col xs={12} sm={4} className="mb-3 mb-sm-0">
            <div className="d-flex align-items-center">
              <div className="me-3 text-warning">
                <HourglassSplit size={32} />
              </div>
              <div>
                <h6
                  className="text-muted mb-0 text-uppercase"
                  style={{ fontSize: '0.75rem' }}
                >
                  Pending
                </h6>
                {loading ? (
                  <Placeholder as="h3" animation="glow">
                    <Placeholder xs={4} />
                  </Placeholder>
                ) : (
                  <h3 className="mb-0 fw-bold">{pending}</h3>
                )}
              </div>
            </div>
          </Col>

          <Col xs={12} sm={4} className="mb-3 mb-sm-0">
            <div className="d-flex align-items-center">
              <div className="me-3 text-info">
                <ArrowRepeat size={32} />
              </div>
              <div>
                <h6
                  className="text-muted mb-0 text-uppercase"
                  style={{ fontSize: '0.75rem' }}
                >
                  Processing
                </h6>
                {loading ? (
                  <Placeholder as="h3" animation="glow">
                    <Placeholder xs={4} />
                  </Placeholder>
                ) : (
                  <h3 className="mb-0 fw-bold">{processing}</h3>
                )}
              </div>
            </div>
          </Col>

          <Col xs={12} sm={4}>
            <div className="d-flex align-items-center">
              <div className="me-3 text-danger">
                <XCircle size={32} />
              </div>
              <div>
                <h6
                  className="text-muted mb-0 text-uppercase"
                  style={{ fontSize: '0.75rem' }}
                >
                  Failed
                </h6>
                {loading ? (
                  <Placeholder as="h3" animation="glow">
                    <Placeholder xs={4} />
                  </Placeholder>
                ) : (
                  <h3 className="mb-0 fw-bold">{failed}</h3>
                )}
              </div>
            </div>
          </Col>
        </Row>

        {/* Action Messages */}
        {actionSuccess && (
          <Alert
            variant="success"
            dismissible
            onClose={() => setActionSuccess(null)}
          >
            <CheckCircle className="me-2" />
            {actionSuccess}
          </Alert>
        )}

        {actionError && (
          <Alert
            variant="danger"
            dismissible
            onClose={() => setActionError(null)}
          >
            <ExclamationTriangle className="me-2" />
            {actionError}
          </Alert>
        )}

        {/* Failed Tasks Table */}
        {failedTasks.length > 0 && !loading && (
          <div className="mt-4">
            <h6 className="mb-3">Failed Tasks</h6>
            <div className="table-responsive">
              <Table striped bordered hover size="sm">
                <thead>
                  <tr>
                    <th>Document ID</th>
                    <th>Filename</th>
                    <th>Error</th>
                    <th>Failed At</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {failedTasks.map((task) => (
                    <tr key={task.id}>
                      <td>{task.id}</td>
                      <td
                        className="text-truncate"
                        style={{ maxWidth: '200px' }}
                      >
                        {task.filename || 'Unknown'}
                      </td>
                      <td
                        className="text-truncate"
                        style={{ maxWidth: '300px' }}
                      >
                        <small className="text-danger" title={task.error}>
                          {task.error || 'Unknown error'}
                        </small>
                      </td>
                      <td>
                        <small>
                          {task.timestamp
                            ? formatDate(task.timestamp)
                            : 'Unknown'}
                        </small>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleRetry(task.id)}
                            disabled={retrying[task.id] || canceling[task.id]}
                            title="Retry processing"
                          >
                            {retrying[task.id] ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-1" />
                                Retrying...
                              </>
                            ) : (
                              <>
                                <ArrowRepeat className="me-1" />
                                Retry
                              </>
                            )}
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleCancel(task.id)}
                            disabled={retrying[task.id] || canceling[task.id]}
                            title="Cancel task"
                          >
                            {canceling[task.id] ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-1" />
                                Canceling...
                              </>
                            ) : (
                              <>
                                <XCircle className="me-1" />
                                Cancel
                              </>
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </div>
        )}

        {failedTasks.length === 0 && !loading && failed > 0 && (
          <div className="mt-4 text-center text-muted">
            <p>No detailed information available for failed tasks.</p>
          </div>
        )}

        {failedTasks.length === 0 && !loading && failed === 0 && (
          <div className="mt-4 text-center text-muted">
            <CheckCircle size={48} className="text-success mb-2" />
            <p className="mb-0">No failed tasks. Queue is healthy!</p>
          </div>
        )}

        {loading && (
          <div className="mt-4">
            <Placeholder as="div" animation="glow">
              <Placeholder xs={12} />
              <Placeholder xs={12} />
              <Placeholder xs={12} />
            </Placeholder>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default OcrQueueMonitor;
