import dashboardReducer, {
  setMetrics,
  setSystemHealth,
  setQueueStatus,
  setRecentErrors,
  addRecentError,
  setLoading,
  setError,
  clearError,
  resetDashboard,
  selectMetrics,
  selectSystemHealth,
  selectQueueStatus,
  selectRecentErrors,
  selectLoading,
  selectError,
  selectIsSystemHealthy,
  selectHasFailedTasks,
} from './dashboardSlice';

describe('dashboardSlice', () => {
  const initialState = {
    metrics: {
      totalDocuments: 0,
      processedToday: 0,
      activeUsers: 0,
      storageUsed: 0,
    },
    systemHealth: {
      status: 'unknown',
      services: {
        backend: { status: 'unknown', message: '' },
        database: { status: 'unknown', message: '' },
        redis: { status: 'unknown', message: '' },
        meilisearch: { status: 'unknown', message: '' },
        ocrService: { status: 'unknown', message: '' },
      },
      lastChecked: null,
    },
    queueStatus: {
      pending: 0,
      processing: 0,
      failed: 0,
      failedTasks: [],
    },
    recentErrors: [],
    loading: false,
    error: null,
  };

  describe('reducers', () => {
    it('should return the initial state', () => {
      expect(dashboardReducer(undefined, { type: 'unknown' })).toEqual(
        initialState
      );
    });

    it('should handle setMetrics', () => {
      const metrics = {
        totalDocuments: 100,
        processedToday: 10,
        activeUsers: 5,
        storageUsed: 1024000,
      };

      const actual = dashboardReducer(initialState, setMetrics(metrics));

      expect(actual.metrics).toEqual(metrics);
    });

    it('should handle partial setMetrics update', () => {
      const state = {
        ...initialState,
        metrics: {
          totalDocuments: 100,
          processedToday: 10,
          activeUsers: 5,
          storageUsed: 1024000,
        },
      };

      const partialUpdate = {
        totalDocuments: 150,
        processedToday: 20,
      };

      const actual = dashboardReducer(state, setMetrics(partialUpdate));

      expect(actual.metrics).toEqual({
        totalDocuments: 150,
        processedToday: 20,
        activeUsers: 5,
        storageUsed: 1024000,
      });
    });

    it('should handle setSystemHealth', () => {
      const systemHealth = {
        status: 'healthy',
        services: {
          backend: { status: 'healthy', message: 'OK' },
          database: { status: 'healthy', message: 'OK' },
          redis: { status: 'healthy', message: 'OK' },
          meilisearch: { status: 'healthy', message: 'OK' },
          ocrService: { status: 'healthy', message: 'OK' },
        },
      };

      const actual = dashboardReducer(
        initialState,
        setSystemHealth(systemHealth)
      );

      expect(actual.systemHealth.status).toBe('healthy');
      expect(actual.systemHealth.services).toEqual(systemHealth.services);
      expect(actual.systemHealth.lastChecked).toBeTruthy();
    });

    it('should handle setQueueStatus', () => {
      const queueStatus = {
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

      const actual = dashboardReducer(
        initialState,
        setQueueStatus(queueStatus)
      );

      expect(actual.queueStatus).toEqual(queueStatus);
    });

    it('should handle setRecentErrors', () => {
      const errors = [
        {
          id: 1,
          type: 'OCR_ERROR',
          message: 'OCR processing failed',
          timestamp: '2025-01-15T10:00:00Z',
          details: { documentId: 123 },
        },
        {
          id: 2,
          type: 'DATABASE_ERROR',
          message: 'Connection timeout',
          timestamp: '2025-01-15T09:00:00Z',
        },
      ];

      const actual = dashboardReducer(initialState, setRecentErrors(errors));

      expect(actual.recentErrors).toEqual(errors);
    });

    it('should handle addRecentError', () => {
      const state = {
        ...initialState,
        recentErrors: [
          {
            id: 1,
            type: 'OCR_ERROR',
            message: 'OCR processing failed',
            timestamp: '2025-01-15T10:00:00Z',
          },
        ],
      };

      const newError = {
        id: 2,
        type: 'DATABASE_ERROR',
        message: 'Connection timeout',
        timestamp: '2025-01-15T11:00:00Z',
      };

      const actual = dashboardReducer(state, addRecentError(newError));

      expect(actual.recentErrors).toHaveLength(2);
      expect(actual.recentErrors[0]).toEqual(newError); // New error is first
      expect(actual.recentErrors[1].id).toBe(1);
    });

    it('should limit recentErrors to 10 items', () => {
      const state = {
        ...initialState,
        recentErrors: Array.from({ length: 10 }, (_, i) => ({
          id: i + 1,
          type: 'ERROR',
          message: `Error ${i + 1}`,
          timestamp: new Date().toISOString(),
        })),
      };

      const newError = {
        id: 11,
        type: 'NEW_ERROR',
        message: 'New error',
        timestamp: new Date().toISOString(),
      };

      const actual = dashboardReducer(state, addRecentError(newError));

      expect(actual.recentErrors).toHaveLength(10);
      expect(actual.recentErrors[0].id).toBe(11);
      expect(actual.recentErrors[9].id).toBe(9); // Last item should be id 9, as id 1 was removed
    });

    it('should handle setLoading', () => {
      const actual = dashboardReducer(initialState, setLoading(true));
      expect(actual.loading).toBe(true);

      const actual2 = dashboardReducer(actual, setLoading(false));
      expect(actual2.loading).toBe(false);
    });

    it('should handle setError', () => {
      const errorMessage = 'Failed to load dashboard data';
      const actual = dashboardReducer(initialState, setError(errorMessage));
      expect(actual.error).toBe(errorMessage);
    });

    it('should handle clearError', () => {
      const state = {
        ...initialState,
        error: 'Some error',
      };

      const actual = dashboardReducer(state, clearError());
      expect(actual.error).toBeNull();
    });

    it('should handle resetDashboard', () => {
      const modifiedState = {
        metrics: {
          totalDocuments: 100,
          processedToday: 10,
          activeUsers: 5,
          storageUsed: 1024000,
        },
        systemHealth: {
          status: 'healthy',
          services: {},
          lastChecked: '2025-01-15T10:00:00Z',
        },
        queueStatus: {
          pending: 5,
          processing: 2,
          failed: 1,
          failedTasks: [],
        },
        recentErrors: [{ id: 1, type: 'ERROR', message: 'Test error' }],
        loading: true,
        error: 'Some error',
      };

      const actual = dashboardReducer(modifiedState, resetDashboard());
      expect(actual).toEqual(initialState);
    });
  });

  describe('selectors', () => {
    const mockState = {
      dashboard: {
        metrics: {
          totalDocuments: 100,
          processedToday: 10,
          activeUsers: 5,
          storageUsed: 1024000,
        },
        systemHealth: {
          status: 'healthy',
          services: {
            backend: { status: 'healthy', message: 'OK' },
            database: { status: 'healthy', message: 'OK' },
          },
          lastChecked: '2025-01-15T10:00:00Z',
        },
        queueStatus: {
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
        },
        recentErrors: [
          {
            id: 1,
            type: 'OCR_ERROR',
            message: 'OCR processing failed',
            timestamp: '2025-01-15T10:00:00Z',
          },
        ],
        loading: false,
        error: null,
      },
    };

    it('should select metrics', () => {
      expect(selectMetrics(mockState)).toEqual(mockState.dashboard.metrics);
    });

    it('should select systemHealth', () => {
      expect(selectSystemHealth(mockState)).toEqual(
        mockState.dashboard.systemHealth
      );
    });

    it('should select queueStatus', () => {
      expect(selectQueueStatus(mockState)).toEqual(
        mockState.dashboard.queueStatus
      );
    });

    it('should select recentErrors', () => {
      expect(selectRecentErrors(mockState)).toEqual(
        mockState.dashboard.recentErrors
      );
    });

    it('should select loading', () => {
      expect(selectLoading(mockState)).toBe(false);
    });

    it('should select error', () => {
      expect(selectError(mockState)).toBeNull();
    });

    it('should select isSystemHealthy when status is healthy', () => {
      expect(selectIsSystemHealthy(mockState)).toBe(true);
    });

    it('should select isSystemHealthy when status is degraded', () => {
      const state = {
        dashboard: {
          ...mockState.dashboard,
          systemHealth: {
            ...mockState.dashboard.systemHealth,
            status: 'degraded',
          },
        },
      };
      expect(selectIsSystemHealthy(state)).toBe(false);
    });

    it('should select hasFailedTasks when failed count is greater than 0', () => {
      expect(selectHasFailedTasks(mockState)).toBe(true);
    });

    it('should select hasFailedTasks when failedTasks array has items', () => {
      const state = {
        dashboard: {
          ...mockState.dashboard,
          queueStatus: {
            pending: 5,
            processing: 2,
            failed: 0,
            failedTasks: [{ id: 123 }],
          },
        },
      };
      expect(selectHasFailedTasks(state)).toBe(true);
    });

    it('should select hasFailedTasks as false when no failures', () => {
      const state = {
        dashboard: {
          ...mockState.dashboard,
          queueStatus: {
            pending: 5,
            processing: 2,
            failed: 0,
            failedTasks: [],
          },
        },
      };
      expect(selectHasFailedTasks(state)).toBe(false);
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete dashboard data update flow', () => {
      let state = initialState;

      // Set loading
      state = dashboardReducer(state, setLoading(true));
      expect(state.loading).toBe(true);

      // Update metrics
      state = dashboardReducer(
        state,
        setMetrics({
          totalDocuments: 100,
          processedToday: 10,
          activeUsers: 5,
          storageUsed: 1024000,
        })
      );

      // Update system health
      state = dashboardReducer(
        state,
        setSystemHealth({
          status: 'healthy',
          services: {
            backend: { status: 'healthy', message: 'OK' },
          },
        })
      );

      // Update queue status
      state = dashboardReducer(
        state,
        setQueueStatus({
          pending: 5,
          processing: 2,
          failed: 1,
          failedTasks: [],
        })
      );

      // Clear loading
      state = dashboardReducer(state, setLoading(false));

      expect(state.loading).toBe(false);
      expect(state.metrics.totalDocuments).toBe(100);
      expect(state.systemHealth.status).toBe('healthy');
      expect(state.queueStatus.pending).toBe(5);
    });

    it('should handle error scenario', () => {
      let state = initialState;

      state = dashboardReducer(state, setLoading(true));
      state = dashboardReducer(state, setError('Failed to load data'));
      state = dashboardReducer(state, setLoading(false));

      expect(state.loading).toBe(false);
      expect(state.error).toBe('Failed to load data');

      // Clear error
      state = dashboardReducer(state, clearError());
      expect(state.error).toBeNull();
    });
  });
});
