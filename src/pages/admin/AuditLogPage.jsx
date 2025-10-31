import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectLogs,
  selectFilters,
  selectPagination,
  selectLoading,
  selectError,
  setLogs,
  setFilters,
  setPagination,
  setLoading,
  setError,
} from '../../features/audit/auditSlice';
import { fetchAuditLogs, exportAuditLogs } from '../../api/auditApi';
import AuditLogTable from '../../components/audit/AuditLogTable';
import AuditLogFilters from '../../components/audit/AuditLogFilters';
import Pagination from '../../components/common/Pagination';
import { showToast } from '../../features/ui/uiSlice';

const AuditLogPage = () => {
  const dispatch = useDispatch();
  const logs = useSelector(selectLogs);
  const filters = useSelector(selectFilters);
  const pagination = useSelector(selectPagination);
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);

  const [exporting, setExporting] = useState(false);

  // Fetch audit logs on component mount and when filters/pagination change
  useEffect(() => {
    loadAuditLogs();
  }, [filters, pagination.currentPage]);

  const loadAuditLogs = async () => {
    try {
      dispatch(setLoading(true));

      const params = {
        ...filters,
        page: pagination.currentPage,
        limit: pagination.pageSize,
      };

      const result = await fetchAuditLogs(params);
      dispatch(setLogs(result.data));
      dispatch(setPagination(result.pagination));
    } catch (err) {
      console.error('Error fetching audit logs:', err);
      dispatch(setError(err.response?.data?.message || 'Failed to fetch audit logs'));
      dispatch(showToast({
        message: 'Failed to load audit logs',
        variant: 'danger',
      }));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleFilterChange = (newFilters) => {
    dispatch(setFilters(newFilters));
  };

  const handlePageChange = (page) => {
    dispatch(setPagination({ currentPage: page }));
  };

  const handleExport = async () => {
    try {
      setExporting(true);

      const blob = await exportAuditLogs(filters);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      dispatch(showToast({
        message: 'Audit logs exported successfully',
        variant: 'success',
      }));
    } catch (err) {
      console.error('Error exporting audit logs:', err);
      dispatch(showToast({
        message: 'Failed to export audit logs',
        variant: 'danger',
      }));
    } finally {
      setExporting(false);
    }
  };

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2>Audit Logs</h2>
              <p className="text-muted mb-0">
                View and search system audit logs
              </p>
            </div>
            <Button
              variant="outline-primary"
              onClick={handleExport}
              disabled={exporting || loading || logs.length === 0}
            >
              {exporting ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  Exporting...
                </>
              ) : (
                <>
                  <i className="bi bi-download me-2"></i>
                  Export CSV
                </>
              )}
            </Button>
          </div>
        </Col>
      </Row>

      {error && (
        <Row className="mb-3">
          <Col>
            <Alert variant="danger" onClose={() => dispatch(setError(null))} dismissible>
              {error}
            </Alert>
          </Col>
        </Row>
      )}

      <Row className="mb-3">
        <Col>
          <Card>
            <Card.Body>
              <AuditLogFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                onReset={() => handleFilterChange({
                  documentId: null,
                  userId: null,
                  action: null,
                  startDate: null,
                  endDate: null,
                })}
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card>
            <Card.Body>
              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </Spinner>
                  <p className="mt-3 text-muted">Loading audit logs...</p>
                </div>
              ) : logs.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-file-text" style={{ fontSize: '3rem', color: '#dee2e6' }}></i>
                  <h5 className="mt-3 text-muted">No audit logs found</h5>
                  <p className="text-muted">
                    Try adjusting your filters or check back later
                  </p>
                </div>
              ) : (
                <>
                  <AuditLogTable logs={logs} />

                  {pagination.totalPages > 1 && (
                    <div className="mt-4">
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
        </Col>
      </Row>
    </Container>
  );
};

export default AuditLogPage;
