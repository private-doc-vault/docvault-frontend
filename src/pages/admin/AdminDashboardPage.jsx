import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Row, Col, Alert, Button } from 'react-bootstrap';
import { ArrowClockwise } from 'react-bootstrap-icons';
import {
  setMetrics,
  setSystemHealth,
  setQueueStatus,
  setRecentErrors,
  setLoading,
  setError,
  selectMetrics,
  selectSystemHealth,
  selectQueueStatus,
  selectRecentErrors,
  selectLoading,
  selectError,
} from '../../features/dashboard/dashboardSlice';
import {
  fetchDashboardMetrics,
  fetchSystemStatus,
  fetchQueueStatus,
  fetchRecentErrors,
} from '../../api/dashboardApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import MetricCard from '../../components/dashboard/MetricCard';
import SystemHealthStatus from '../../components/dashboard/SystemHealthStatus';
import OcrQueueMonitor from '../../components/dashboard/OcrQueueMonitor';
import ActivityChart from '../../components/dashboard/ActivityChart';

const AdminDashboardPage = () => {
  const dispatch = useDispatch();
  const metrics = useSelector(selectMetrics);
  const systemHealth = useSelector(selectSystemHealth);
  const queueStatus = useSelector(selectQueueStatus);
  const recentErrors = useSelector(selectRecentErrors);
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);

  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);

  /**
   * Fetch all dashboard data
   */
  const fetchDashboardData = async () => {
    dispatch(setLoading(true));
    dispatch(setError(null));

    try {
      // Fetch all dashboard data in parallel
      const [metricsData, healthData, queueData, errorsData] = await Promise.allSettled([
        fetchDashboardMetrics(),
        fetchSystemStatus(),
        fetchQueueStatus(),
        fetchRecentErrors(),
      ]);

      // Update metrics if successful
      if (metricsData.status === 'fulfilled') {
        dispatch(setMetrics(metricsData.value));
      }

      // Update system health if successful
      if (healthData.status === 'fulfilled') {
        dispatch(setSystemHealth(healthData.value));
      }

      // Update queue status if successful
      if (queueData.status === 'fulfilled') {
        dispatch(setQueueStatus(queueData.value));
      }

      // Update recent errors if successful
      if (errorsData.status === 'fulfilled') {
        dispatch(setRecentErrors(errorsData.value));
      }

      // Check if any requests failed
      const failures = [metricsData, healthData, queueData, errorsData].filter(
        (result) => result.status === 'rejected'
      );

      if (failures.length > 0) {
        console.warn('Some dashboard data failed to load:', failures);
        dispatch(
          setError(
            `Failed to load ${failures.length} dashboard section${failures.length > 1 ? 's' : ''}. Check console for details.`
          )
        );
      }

      setLastRefresh(new Date());
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      dispatch(setError('Failed to load dashboard data. Please try again.'));
    } finally {
      dispatch(setLoading(false));
    }
  };

  /**
   * Handle manual refresh
   */
  const handleRefresh = () => {
    fetchDashboardData();
  };

  /**
   * Toggle auto-refresh
   */
  const toggleAutoRefresh = () => {
    setAutoRefresh(!autoRefresh);
  };

  // Initial data fetch on mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Set up auto-refresh interval
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchDashboardData();
      }, 60000); // Refresh every 60 seconds

      setRefreshInterval(interval);

      return () => {
        if (interval) {
          clearInterval(interval);
        }
      };
    } else {
      if (refreshInterval) {
        clearInterval(refreshInterval);
        setRefreshInterval(null);
      }
    }
  }, [autoRefresh]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [refreshInterval]);

  if (loading && !lastRefresh) {
    return (
      <Container className="py-5">
        <LoadingSpinner />
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      {/* Page Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h3 mb-1">Admin Dashboard</h1>
              {lastRefresh && (
                <small className="text-muted">
                  Last updated: {lastRefresh.toLocaleTimeString()}
                </small>
              )}
            </div>
            <div className="d-flex gap-2">
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={toggleAutoRefresh}
                active={autoRefresh}
              >
                Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleRefresh}
                disabled={loading}
              >
                <ArrowClockwise className={loading ? 'spinner-border spinner-border-sm' : ''} />{' '}
                Refresh
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {/* Error Alert */}
      {error && (
        <Row className="mb-3">
          <Col>
            <Alert variant="warning" dismissible onClose={() => dispatch(setError(null))}>
              {error}
            </Alert>
          </Col>
        </Row>
      )}

      {/* System Health Status */}
      <Row className="mb-4">
        <Col>
          <SystemHealthStatus systemHealth={systemHealth} loading={loading} />
        </Col>
      </Row>

      {/* Metric Cards */}
      <Row className="mb-4">
        <Col xs={12} sm={6} lg={3} className="mb-3">
          <MetricCard
            title="Total Documents"
            value={metrics.totalDocuments}
            icon="file-earmark-text"
            variant="primary"
            loading={loading}
          />
        </Col>
        <Col xs={12} sm={6} lg={3} className="mb-3">
          <MetricCard
            title="Processed Today"
            value={metrics.processedToday}
            icon="check-circle"
            variant="success"
            loading={loading}
          />
        </Col>
        <Col xs={12} sm={6} lg={3} className="mb-3">
          <MetricCard
            title="Active Users"
            value={metrics.activeUsers}
            icon="people"
            variant="info"
            loading={loading}
          />
        </Col>
        <Col xs={12} sm={6} lg={3} className="mb-3">
          <MetricCard
            title="Storage Used"
            value={metrics.storageUsed}
            icon="hdd"
            variant="warning"
            isStorage
            loading={loading}
          />
        </Col>
      </Row>

      {/* OCR Queue Monitor */}
      <Row className="mb-4">
        <Col>
          <OcrQueueMonitor queueStatus={queueStatus} loading={loading} />
        </Col>
      </Row>

      {/* Activity Charts */}
      <Row className="mb-4">
        <Col xs={12} lg={6} className="mb-3">
          <ActivityChart title="Documents Processed (Last 7 Days)" type="documents" />
        </Col>
        <Col xs={12} lg={6} className="mb-3">
          <ActivityChart title="User Activity (Last 7 Days)" type="users" />
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <ActivityChart title="Storage Usage Trend (Last 30 Days)" type="storage" />
        </Col>
      </Row>

      {/* Recent Errors Section */}
      {recentErrors && recentErrors.length > 0 && (
        <Row className="mb-4">
          <Col>
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Recent Errors & Warnings</h5>
              </div>
              <div className="card-body">
                {recentErrors.map((error, index) => (
                  <Alert key={error.id || index} variant="danger" className="mb-2">
                    <div className="d-flex justify-content-between">
                      <div>
                        <strong>{error.type}:</strong> {error.message}
                      </div>
                      <small className="text-muted">
                        {new Date(error.timestamp).toLocaleString()}
                      </small>
                    </div>
                    {error.details && (
                      <details className="mt-2">
                        <summary style={{ cursor: 'pointer' }}>Show details</summary>
                        <pre className="mt-2 mb-0 small">{JSON.stringify(error.details, null, 2)}</pre>
                      </details>
                    )}
                  </Alert>
                ))}
              </div>
            </div>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default AdminDashboardPage;
