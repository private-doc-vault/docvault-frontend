import React, { useEffect, useState } from 'react';
import { Card, Spinner, Alert, Button } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { fetchDocumentAuditLogs } from '../../api/auditApi';
import AuditLogTable from './AuditLogTable';
import Pagination from '../common/Pagination';

/**
 * DocumentAuditLog Component
 * Displays audit logs for a specific document
 */
const DocumentAuditLog = ({ documentId }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0,
  });

  useEffect(() => {
    if (documentId) {
      loadLogs();
    }
  }, [documentId, pagination.currentPage]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await fetchDocumentAuditLogs(
        documentId,
        pagination.currentPage,
        pagination.pageSize
      );

      setLogs(result.data);
      setPagination(result.pagination);
    } catch (err) {
      console.error('Error fetching document audit logs:', err);
      setError(err.response?.data?.message || 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
  };

  const handleRefresh = () => {
    loadLogs();
  };

  if (loading) {
    return (
      <Card>
        <Card.Body className="text-center py-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-3 text-muted">Loading audit history...</p>
        </Card.Body>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <Card.Body>
          <Alert variant="danger" className="mb-0">
            <Alert.Heading>Error Loading Audit Logs</Alert.Heading>
            <p className="mb-0">{error}</p>
            <hr />
            <div className="d-flex justify-content-end">
              <Button variant="outline-danger" size="sm" onClick={handleRefresh}>
                Retry
              </Button>
            </div>
          </Alert>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card>
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h5 className="mb-0">
          <i className="bi bi-clock-history me-2"></i>
          Audit History
        </h5>
        <Button variant="outline-secondary" size="sm" onClick={handleRefresh}>
          <i className="bi bi-arrow-clockwise me-1"></i>
          Refresh
        </Button>
      </Card.Header>
      <Card.Body>
        {logs.length === 0 ? (
          <div className="text-center py-4">
            <i className="bi bi-file-text" style={{ fontSize: '2rem', color: '#dee2e6' }}></i>
            <p className="mt-3 text-muted mb-0">No audit logs found for this document</p>
          </div>
        ) : (
          <>
            <AuditLogTable logs={logs} />

            {pagination.totalPages > 1 && (
              <div className="mt-3">
                <Pagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                  totalItems={pagination.totalItems}
                  itemsPerPage={pagination.pageSize}
                />
              </div>
            )}
          </>
        )}
      </Card.Body>
    </Card>
  );
};

DocumentAuditLog.propTypes = {
  documentId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default DocumentAuditLog;
