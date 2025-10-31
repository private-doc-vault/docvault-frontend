import React from 'react';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../test-utils/renderWithProviders';
import AdminDashboardPage from './AdminDashboardPage';
import * as dashboardApi from '../../api/dashboardApi';

// Mock the dashboard API
jest.mock('../../api/dashboardApi');

// Mock the child components to simplify testing
jest.mock('../../components/dashboard/MetricCard', () => ({
  __esModule: true,
  default: ({ title, value, loading }) => (
    <div data-testid="metric-card">
      <div>{title}</div>
      {loading ? <div>Loading...</div> : <div>{value}</div>}
    </div>
  ),
}));

jest.mock('../../components/dashboard/SystemHealthStatus', () => ({
  __esModule: true,
  default: ({ systemHealth, loading }) => (
    <div data-testid="system-health">
      {loading ? <div>Loading...</div> : <div>Status: {systemHealth.status}</div>}
    </div>
  ),
}));

jest.mock('../../components/dashboard/OcrQueueMonitor', () => ({
  __esModule: true,
  default: ({ queueStatus, loading }) => (
    <div data-testid="ocr-queue-monitor">
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div>
          Pending: {queueStatus.pending}, Processing: {queueStatus.processing}, Failed:{' '}
          {queueStatus.failed}
        </div>
      )}
    </div>
  ),
}));

jest.mock('../../components/dashboard/ActivityChart', () => ({
  __esModule: true,
  default: ({ title, type }) => (
    <div data-testid="activity-chart">
      {title} ({type})
    </div>
  ),
}));

describe('AdminDashboardPage', () => {
  const mockMetricsData = {
    totalDocuments: 100,
    processedToday: 10,
    activeUsers: 5,
    storageUsed: 1024000,
  };

  const mockSystemHealthData = {
    status: 'healthy',
    services: {
      backend: { status: 'healthy', message: 'OK' },
      database: { status: 'healthy', message: 'OK' },
      redis: { status: 'healthy', message: 'OK' },
      meilisearch: { status: 'healthy', message: 'OK' },
      ocrService: { status: 'healthy', message: 'OK' },
    },
  };

  const mockQueueStatusData = {
    pending: 5,
    processing: 2,
    failed: 1,
    failedTasks: [
      {
        id: 123,
        filename: 'test.pdf',
        error: 'OCR failed',
        timestamp: '2025-01-15T10:00:00Z',
      },
    ],
  };

  const mockRecentErrorsData = [
    {
      id: 1,
      type: 'OCR_ERROR',
      message: 'OCR processing failed',
      timestamp: '2025-01-15T10:00:00Z',
      details: { documentId: 123 },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    // Mock successful API responses by default
    dashboardApi.fetchDashboardMetrics.mockResolvedValue(mockMetricsData);
    dashboardApi.fetchSystemStatus.mockResolvedValue(mockSystemHealthData);
    dashboardApi.fetchQueueStatus.mockResolvedValue(mockQueueStatusData);
    dashboardApi.fetchRecentErrors.mockResolvedValue(mockRecentErrorsData);
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Initial Rendering', () => {
    it('should render the dashboard page with title', async () => {
      renderWithProviders(<AdminDashboardPage />);

      await waitFor(() => {
        expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
      });
    });

    it('should show loading spinner initially', () => {
      renderWithProviders(<AdminDashboardPage />);

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    it('should fetch dashboard data on mount', async () => {
      renderWithProviders(<AdminDashboardPage />);

      await waitFor(() => {
        expect(dashboardApi.fetchDashboardMetrics).toHaveBeenCalledTimes(1);
        expect(dashboardApi.fetchSystemStatus).toHaveBeenCalledTimes(1);
        expect(dashboardApi.fetchQueueStatus).toHaveBeenCalledTimes(1);
        expect(dashboardApi.fetchRecentErrors).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Data Display', () => {
    it('should display metric cards after data loads', async () => {
      renderWithProviders(<AdminDashboardPage />);

      await waitFor(() => {
        const metricCards = screen.getAllByTestId('metric-card');
        expect(metricCards).toHaveLength(4); // 4 metric cards
      });
    });

    it('should display system health status', async () => {
      renderWithProviders(<AdminDashboardPage />);

      await waitFor(() => {
        const systemHealth = screen.getByTestId('system-health');
        expect(within(systemHealth).getByText(/Status: healthy/i)).toBeInTheDocument();
      });
    });

    it('should display OCR queue monitor', async () => {
      renderWithProviders(<AdminDashboardPage />);

      await waitFor(() => {
        const queueMonitor = screen.getByTestId('ocr-queue-monitor');
        expect(
          within(queueMonitor).getByText(/Pending: 5, Processing: 2, Failed: 1/i)
        ).toBeInTheDocument();
      });
    });

    it('should display activity charts', async () => {
      renderWithProviders(<AdminDashboardPage />);

      await waitFor(() => {
        const charts = screen.getAllByTestId('activity-chart');
        expect(charts).toHaveLength(3); // 3 charts: documents, users, storage
      });
    });

    it('should display recent errors section when errors exist', async () => {
      renderWithProviders(<AdminDashboardPage />);

      await waitFor(() => {
        expect(screen.getByText('Recent Errors & Warnings')).toBeInTheDocument();
        expect(screen.getByText(/OCR_ERROR:/i)).toBeInTheDocument();
        expect(screen.getByText(/OCR processing failed/i)).toBeInTheDocument();
      });
    });

    it('should not display recent errors section when no errors', async () => {
      dashboardApi.fetchRecentErrors.mockResolvedValue([]);

      renderWithProviders(<AdminDashboardPage />);

      await waitFor(() => {
        expect(screen.queryByText('Recent Errors & Warnings')).not.toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error message when API calls fail', async () => {
      dashboardApi.fetchDashboardMetrics.mockRejectedValue(new Error('API Error'));

      renderWithProviders(<AdminDashboardPage />);

      await waitFor(() => {
        expect(screen.getByText(/Failed to load.*dashboard section/i)).toBeInTheDocument();
      });
    });

    it('should still display successful data when some API calls fail', async () => {
      dashboardApi.fetchDashboardMetrics.mockRejectedValue(new Error('API Error'));
      // Other API calls succeed

      renderWithProviders(<AdminDashboardPage />);

      await waitFor(() => {
        // Should still show system health and queue monitor
        expect(screen.getByTestId('system-health')).toBeInTheDocument();
        expect(screen.getByTestId('ocr-queue-monitor')).toBeInTheDocument();
      });
    });
  });

  describe('Refresh Functionality', () => {
    it('should have auto-refresh enabled by default', async () => {
      renderWithProviders(<AdminDashboardPage />);

      await waitFor(() => {
        expect(screen.getByText(/Auto-refresh ON/i)).toBeInTheDocument();
      });
    });

    it('should toggle auto-refresh when button is clicked', async () => {
      const user = userEvent.setup({ delay: null });
      renderWithProviders(<AdminDashboardPage />);

      await waitFor(() => {
        expect(screen.getByText(/Auto-refresh ON/i)).toBeInTheDocument();
      });

      const autoRefreshButton = screen.getByText(/Auto-refresh ON/i);
      await user.click(autoRefreshButton);

      expect(screen.getByText(/Auto-refresh OFF/i)).toBeInTheDocument();
    });

    it('should refresh data when manual refresh button is clicked', async () => {
      const user = userEvent.setup({ delay: null });
      renderWithProviders(<AdminDashboardPage />);

      // Wait for initial load
      await waitFor(() => {
        expect(dashboardApi.fetchDashboardMetrics).toHaveBeenCalledTimes(1);
      });

      // Click refresh button (get all buttons and find the specific one)
      const buttons = screen.getAllByRole('button');
      const refreshButton = buttons.find(btn => btn.textContent.trim().match(/^Refresh$/i));
      await user.click(refreshButton);

      // Should fetch again
      await waitFor(() => {
        expect(dashboardApi.fetchDashboardMetrics).toHaveBeenCalledTimes(2);
      });
    });

    it('should auto-refresh data every 60 seconds when enabled', async () => {
      renderWithProviders(<AdminDashboardPage />);

      // Initial fetch
      await waitFor(() => {
        expect(dashboardApi.fetchDashboardMetrics).toHaveBeenCalledTimes(1);
      });

      // Fast-forward 60 seconds
      jest.advanceTimersByTime(60000);

      // Should fetch again
      await waitFor(() => {
        expect(dashboardApi.fetchDashboardMetrics).toHaveBeenCalledTimes(2);
      });
    });

    it('should not auto-refresh when disabled', async () => {
      const user = userEvent.setup({ delay: null });
      renderWithProviders(<AdminDashboardPage />);

      // Wait for initial load
      await waitFor(() => {
        expect(dashboardApi.fetchDashboardMetrics).toHaveBeenCalledTimes(1);
      });

      // Disable auto-refresh
      const autoRefreshButton = screen.getByText(/Auto-refresh ON/i);
      await user.click(autoRefreshButton);

      // Fast-forward 60 seconds
      jest.advanceTimersByTime(60000);

      // Should not fetch again
      expect(dashboardApi.fetchDashboardMetrics).toHaveBeenCalledTimes(1);
    });

    it('should display last refresh timestamp', async () => {
      renderWithProviders(<AdminDashboardPage />);

      await waitFor(() => {
        expect(screen.getByText(/Last updated:/i)).toBeInTheDocument();
      });
    });
  });

  describe('Recent Errors Details', () => {
    it('should show expandable details for errors', async () => {
      renderWithProviders(<AdminDashboardPage />);

      await waitFor(() => {
        expect(screen.getByText('Show details')).toBeInTheDocument();
      });
    });

    it('should expand error details when clicked', async () => {
      const user = userEvent.setup({ delay: null });
      renderWithProviders(<AdminDashboardPage />);

      await waitFor(() => {
        expect(screen.getByText('Show details')).toBeInTheDocument();
      });

      const detailsButton = screen.getByText('Show details');
      await user.click(detailsButton);

      // Details should be visible (containing documentId)
      await waitFor(() => {
        expect(screen.getByText(/"documentId": 123/i)).toBeInTheDocument();
      });
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle complete dashboard workflow', async () => {
      const user = userEvent.setup({ delay: null });
      renderWithProviders(<AdminDashboardPage />);

      // 1. Initial load
      await waitFor(() => {
        expect(screen.getByTestId('system-health')).toBeInTheDocument();
        expect(dashboardApi.fetchDashboardMetrics).toHaveBeenCalledTimes(1);
      });

      // 2. Manual refresh
      const buttons = screen.getAllByRole('button');
      const refreshButton = buttons.find(btn => btn.textContent.trim().match(/^Refresh$/i));
      await user.click(refreshButton);

      await waitFor(() => {
        expect(dashboardApi.fetchDashboardMetrics).toHaveBeenCalledTimes(2);
      });

      // 3. Toggle auto-refresh
      const autoRefreshButton = screen.getByText(/Auto-refresh ON/i);
      await user.click(autoRefreshButton);

      expect(screen.getByText(/Auto-refresh OFF/i)).toBeInTheDocument();
    });

    it('should handle partial data loading gracefully', async () => {
      // Simulate one API failing
      dashboardApi.fetchRecentErrors.mockRejectedValue(new Error('Failed'));

      renderWithProviders(<AdminDashboardPage />);

      await waitFor(() => {
        // Should still show other sections
        expect(screen.getByTestId('system-health')).toBeInTheDocument();
        expect(screen.getByTestId('ocr-queue-monitor')).toBeInTheDocument();

        // Should show warning about partial failure
        expect(screen.getByText(/Failed to load.*dashboard section/i)).toBeInTheDocument();
      });
    });
  });
});
