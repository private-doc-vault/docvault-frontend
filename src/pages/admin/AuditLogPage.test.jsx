import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import AuditLogPage from './AuditLogPage';
import auditReducer from '../../features/audit/auditSlice';
import uiReducer from '../../features/ui/uiSlice';
import * as auditApi from '../../api/auditApi';

// Mock the API
jest.mock('../../api/auditApi');

const mockLogs = [
  {
    id: 1,
    timestamp: '2024-01-15T10:30:00Z',
    userId: 100,
    userName: 'John Doe',
    action: 'create',
    documentId: 50,
    documentName: 'Report.pdf',
    ipAddress: '192.168.1.1',
    details: 'Created new document',
  },
  {
    id: 2,
    timestamp: '2024-01-15T11:00:00Z',
    userId: 101,
    userName: 'Jane Smith',
    action: 'update',
    documentId: 50,
    documentName: 'Report.pdf',
    ipAddress: '192.168.1.2',
    details: 'Updated metadata',
  },
  {
    id: 3,
    timestamp: '2024-01-15T12:00:00Z',
    userId: 100,
    userName: 'John Doe',
    action: 'delete',
    documentId: 51,
    documentName: 'Old.pdf',
    ipAddress: '192.168.1.1',
    details: 'Deleted document',
  },
];

const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      audit: auditReducer,
      ui: uiReducer,
    },
    preloadedState: initialState,
  });
};

const renderWithProviders = (component, initialState = {}) => {
  const store = createTestStore(initialState);
  return {
    ...render(
      <Provider store={store}>
        <BrowserRouter>{component}</BrowserRouter>
      </Provider>
    ),
    store,
  };
};

describe('AuditLogPage Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial Load', () => {
    it('should fetch and display audit logs on mount', async () => {
      auditApi.fetchAuditLogs.mockResolvedValue({
        data: mockLogs,
        pagination: {
          currentPage: 1,
          pageSize: 20,
          totalItems: 3,
          totalPages: 1,
        },
      });

      renderWithProviders(<AuditLogPage />);

      // Should show loading state initially
      expect(screen.getByText(/Loading audit logs/i)).toBeInTheDocument();

      // Wait for data to load
      await waitFor(() => {
        expect(
          screen.queryByText(/Loading audit logs/i)
        ).not.toBeInTheDocument();
      });

      // Should display logs (use getAllByText for items that appear multiple times)
      expect(screen.getAllByText('John Doe').length).toBeGreaterThan(0);
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getAllByText('Report.pdf').length).toBeGreaterThan(0);
    });

    it('should display error message when fetch fails', async () => {
      auditApi.fetchAuditLogs.mockRejectedValue({
        response: {
          data: {
            message: 'Failed to fetch audit logs',
          },
        },
      });

      renderWithProviders(<AuditLogPage />);

      await waitFor(() => {
        expect(
          screen.getByText(/Failed to fetch audit logs/i)
        ).toBeInTheDocument();
      });
    });

    it('should display empty state when no logs found', async () => {
      auditApi.fetchAuditLogs.mockResolvedValue({
        data: [],
        pagination: {
          currentPage: 1,
          pageSize: 20,
          totalItems: 0,
          totalPages: 0,
        },
      });

      renderWithProviders(<AuditLogPage />);

      await waitFor(() => {
        expect(screen.getByText(/No audit logs found/i)).toBeInTheDocument();
      });
    });
  });

  describe('Filtering', () => {
    it('should apply filters and refetch logs', async () => {
      auditApi.fetchAuditLogs.mockResolvedValue({
        data: mockLogs,
        pagination: {
          currentPage: 1,
          pageSize: 20,
          totalItems: 3,
          totalPages: 1,
        },
      });

      renderWithProviders(<AuditLogPage />);

      await waitFor(() => {
        expect(screen.getAllByText('John Doe').length).toBeGreaterThan(0);
      });

      // Find and fill in filter fields
      const userIdInput = screen.getByLabelText(/User ID/i);
      const actionSelect = screen.getByLabelText(/Action/i);

      fireEvent.change(userIdInput, { target: { value: '100' } });
      fireEvent.change(actionSelect, { target: { value: 'create' } });

      // Click Apply Filters button
      const applyButton = screen.getByRole('button', {
        name: /Apply Filters/i,
      });
      fireEvent.click(applyButton);

      // Should call API with filters
      await waitFor(() => {
        expect(auditApi.fetchAuditLogs).toHaveBeenCalledWith(
          expect.objectContaining({
            userId: '100',
            action: 'create',
          })
        );
      });
    });

    it('should reset filters when reset button is clicked', async () => {
      auditApi.fetchAuditLogs.mockResolvedValue({
        data: mockLogs,
        pagination: {
          currentPage: 1,
          pageSize: 20,
          totalItems: 3,
          totalPages: 1,
        },
      });

      renderWithProviders(<AuditLogPage />);

      await waitFor(() => {
        expect(screen.getAllByText('John Doe').length).toBeGreaterThan(0);
      });

      // Apply some filters first
      const userIdInput = screen.getByLabelText(/User ID/i);
      fireEvent.change(userIdInput, { target: { value: '100' } });

      // Click Reset button
      const resetButton = screen.getByRole('button', { name: /Reset/i });
      fireEvent.click(resetButton);

      // Should clear the input
      expect(userIdInput.value).toBe('');

      // Should refetch with empty filters
      await waitFor(() => {
        expect(auditApi.fetchAuditLogs).toHaveBeenCalledWith(
          expect.objectContaining({
            userId: null,
            action: null,
          })
        );
      });
    });
  });

  describe('Pagination', () => {
    it('should change page when pagination is clicked', async () => {
      auditApi.fetchAuditLogs.mockResolvedValue({
        data: mockLogs,
        pagination: {
          currentPage: 1,
          pageSize: 20,
          totalItems: 60,
          totalPages: 3,
        },
      });

      renderWithProviders(<AuditLogPage />);

      await waitFor(() => {
        expect(screen.getAllByText('John Doe').length).toBeGreaterThan(0);
      });

      // Find pagination button for page 2
      const page2Button = screen.getByRole('button', { name: '2' });
      fireEvent.click(page2Button);

      // Should call API with new page
      await waitFor(() => {
        expect(auditApi.fetchAuditLogs).toHaveBeenCalledWith(
          expect.objectContaining({
            page: 2,
          })
        );
      });
    });

    it('should not display pagination when only one page', async () => {
      auditApi.fetchAuditLogs.mockResolvedValue({
        data: mockLogs,
        pagination: {
          currentPage: 1,
          pageSize: 20,
          totalItems: 3,
          totalPages: 1,
        },
      });

      renderWithProviders(<AuditLogPage />);

      await waitFor(() => {
        expect(screen.getAllByText('John Doe').length).toBeGreaterThan(0);
      });

      // Pagination component should not be rendered
      expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    });
  });

  describe('Export Functionality', () => {
    it('should export audit logs to CSV', async () => {
      auditApi.fetchAuditLogs.mockResolvedValue({
        data: mockLogs,
        pagination: {
          currentPage: 1,
          pageSize: 20,
          totalItems: 3,
          totalPages: 1,
        },
      });

      const mockBlob = new Blob(['test csv data'], { type: 'text/csv' });
      auditApi.exportAuditLogs.mockResolvedValue(mockBlob);

      // Mock URL.createObjectURL
      global.URL.createObjectURL = jest.fn(() => 'mock-url');
      global.URL.revokeObjectURL = jest.fn();

      renderWithProviders(<AuditLogPage />);

      await waitFor(() => {
        expect(screen.getAllByText('John Doe').length).toBeGreaterThan(0);
      });

      // Click export button
      const exportButton = screen.getByRole('button', { name: /Export CSV/i });
      fireEvent.click(exportButton);

      // Should call export API
      await waitFor(() => {
        expect(auditApi.exportAuditLogs).toHaveBeenCalled();
        expect(global.URL.createObjectURL).toHaveBeenCalledWith(mockBlob);
      });
    });

    it('should disable export button when no logs', async () => {
      auditApi.fetchAuditLogs.mockResolvedValue({
        data: [],
        pagination: {
          currentPage: 1,
          pageSize: 20,
          totalItems: 0,
          totalPages: 0,
        },
      });

      renderWithProviders(<AuditLogPage />);

      await waitFor(() => {
        expect(screen.getByText(/No audit logs found/i)).toBeInTheDocument();
      });

      const exportButton = screen.getByRole('button', { name: /Export CSV/i });
      expect(exportButton).toBeDisabled();
    });
  });

  describe('Action Badges', () => {
    it('should display action badges for different action types', async () => {
      auditApi.fetchAuditLogs.mockResolvedValue({
        data: mockLogs,
        pagination: {
          currentPage: 1,
          pageSize: 20,
          totalItems: 3,
          totalPages: 1,
        },
      });

      renderWithProviders(<AuditLogPage />);

      await waitFor(() => {
        expect(screen.getByText('create')).toBeInTheDocument();
        expect(screen.getByText('update')).toBeInTheDocument();
        expect(screen.getByText('delete')).toBeInTheDocument();
      });
    });
  });

  describe('Clickable Links', () => {
    it('should have clickable user names', async () => {
      auditApi.fetchAuditLogs.mockResolvedValue({
        data: mockLogs,
        pagination: {
          currentPage: 1,
          pageSize: 20,
          totalItems: 3,
          totalPages: 1,
        },
      });

      renderWithProviders(<AuditLogPage />);

      await waitFor(() => {
        const userNames = screen.getAllByText('John Doe');
        expect(userNames.length).toBeGreaterThan(0);
        expect(userNames[0]).toHaveStyle({ cursor: 'pointer' });
      });
    });

    it('should have clickable document names', async () => {
      auditApi.fetchAuditLogs.mockResolvedValue({
        data: mockLogs,
        pagination: {
          currentPage: 1,
          pageSize: 20,
          totalItems: 3,
          totalPages: 1,
        },
      });

      renderWithProviders(<AuditLogPage />);

      await waitFor(() => {
        const docNames = screen.getAllByText('Report.pdf');
        expect(docNames.length).toBeGreaterThan(0);
        expect(docNames[0]).toHaveStyle({ cursor: 'pointer' });
      });
    });
  });
});
