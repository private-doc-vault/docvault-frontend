import auditReducer, {
  setLogs,
  setFilters,
  setPagination,
  setLoading,
  setError,
  clearFilters,
  clearError,
  selectLogs,
  selectFilters,
  selectPagination,
  selectLoading,
  selectError,
} from './auditSlice';

describe('auditSlice', () => {
  const initialState = {
    logs: [],
    filters: {
      documentId: null,
      userId: null,
      action: null,
      startDate: null,
      endDate: null,
    },
    pagination: {
      currentPage: 1,
      pageSize: 20,
      totalItems: 0,
      totalPages: 0,
    },
    loading: false,
    error: null,
  };

  describe('reducers', () => {
    it('should return the initial state', () => {
      expect(auditReducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });

    it('should handle setLogs', () => {
      const logs = [
        { id: 1, action: 'create', timestamp: '2024-01-01' },
        { id: 2, action: 'update', timestamp: '2024-01-02' },
      ];

      const actual = auditReducer(initialState, setLogs(logs));

      expect(actual.logs).toEqual(logs);
      expect(actual.loading).toBe(false);
      expect(actual.error).toBe(null);
    });

    it('should handle setFilters', () => {
      const filters = {
        documentId: '123',
        userId: '456',
        action: 'create',
      };

      const actual = auditReducer(initialState, setFilters(filters));

      expect(actual.filters.documentId).toBe('123');
      expect(actual.filters.userId).toBe('456');
      expect(actual.filters.action).toBe('create');
      expect(actual.pagination.currentPage).toBe(1); // Should reset to page 1
    });

    it('should handle setFilters with partial update', () => {
      const stateWithFilters = {
        ...initialState,
        filters: {
          ...initialState.filters,
          documentId: '123',
          userId: '456',
        },
      };

      const actual = auditReducer(
        stateWithFilters,
        setFilters({ action: 'update' })
      );

      expect(actual.filters.documentId).toBe('123');
      expect(actual.filters.userId).toBe('456');
      expect(actual.filters.action).toBe('update');
    });

    it('should handle setPagination', () => {
      const pagination = {
        currentPage: 2,
        totalItems: 100,
        totalPages: 5,
      };

      const actual = auditReducer(initialState, setPagination(pagination));

      expect(actual.pagination.currentPage).toBe(2);
      expect(actual.pagination.totalItems).toBe(100);
      expect(actual.pagination.totalPages).toBe(5);
      expect(actual.pagination.pageSize).toBe(20); // Should keep existing value
    });

    it('should handle setLoading', () => {
      const actual = auditReducer(initialState, setLoading(true));
      expect(actual.loading).toBe(true);

      const actual2 = auditReducer(actual, setLoading(false));
      expect(actual2.loading).toBe(false);
    });

    it('should handle setError', () => {
      const error = 'Failed to fetch audit logs';
      const actual = auditReducer(initialState, setError(error));

      expect(actual.error).toBe(error);
      expect(actual.loading).toBe(false);
    });

    it('should handle clearFilters', () => {
      const stateWithFilters = {
        ...initialState,
        filters: {
          documentId: '123',
          userId: '456',
          action: 'create',
          startDate: '2024-01-01',
          endDate: '2024-01-31',
        },
        pagination: {
          ...initialState.pagination,
          currentPage: 3,
        },
      };

      const actual = auditReducer(stateWithFilters, clearFilters());

      expect(actual.filters).toEqual(initialState.filters);
      expect(actual.pagination.currentPage).toBe(1);
    });

    it('should handle clearError', () => {
      const stateWithError = {
        ...initialState,
        error: 'Some error',
      };

      const actual = auditReducer(stateWithError, clearError());

      expect(actual.error).toBe(null);
    });
  });

  describe('selectors', () => {
    const mockState = {
      audit: {
        logs: [{ id: 1, action: 'create' }],
        filters: {
          documentId: '123',
          userId: null,
          action: 'update',
          startDate: null,
          endDate: null,
        },
        pagination: {
          currentPage: 2,
          pageSize: 20,
          totalItems: 50,
          totalPages: 3,
        },
        loading: true,
        error: 'Test error',
      },
    };

    it('should select logs', () => {
      expect(selectLogs(mockState)).toEqual([{ id: 1, action: 'create' }]);
    });

    it('should select filters', () => {
      expect(selectFilters(mockState)).toEqual({
        documentId: '123',
        userId: null,
        action: 'update',
        startDate: null,
        endDate: null,
      });
    });

    it('should select pagination', () => {
      expect(selectPagination(mockState)).toEqual({
        currentPage: 2,
        pageSize: 20,
        totalItems: 50,
        totalPages: 3,
      });
    });

    it('should select loading', () => {
      expect(selectLoading(mockState)).toBe(true);
    });

    it('should select error', () => {
      expect(selectError(mockState)).toBe('Test error');
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete audit log fetch flow', () => {
      let state = initialState;

      // Start loading
      state = auditReducer(state, setLoading(true));
      expect(state.loading).toBe(true);

      // Set logs on success
      const logs = [
        { id: 1, action: 'create', timestamp: '2024-01-01' },
        { id: 2, action: 'update', timestamp: '2024-01-02' },
      ];
      state = auditReducer(state, setLogs(logs));
      expect(state.logs).toEqual(logs);
      expect(state.loading).toBe(false);
      expect(state.error).toBe(null);
    });

    it('should handle error flow', () => {
      let state = initialState;

      // Start loading
      state = auditReducer(state, setLoading(true));
      expect(state.loading).toBe(true);

      // Set error
      state = auditReducer(state, setError('Network error'));
      expect(state.error).toBe('Network error');
      expect(state.loading).toBe(false);
    });

    it('should handle filter change and pagination reset', () => {
      let state = {
        ...initialState,
        pagination: {
          ...initialState.pagination,
          currentPage: 5,
        },
      };

      // Change filters - should reset pagination
      state = auditReducer(state, setFilters({ action: 'delete' }));
      expect(state.filters.action).toBe('delete');
      expect(state.pagination.currentPage).toBe(1);
    });

    it('should handle clearing filters while preserving other state', () => {
      let state = {
        ...initialState,
        logs: [{ id: 1, action: 'create' }],
        filters: {
          documentId: '123',
          userId: '456',
          action: 'update',
          startDate: '2024-01-01',
          endDate: '2024-01-31',
        },
        loading: true,
      };

      state = auditReducer(state, clearFilters());

      expect(state.filters).toEqual(initialState.filters);
      expect(state.logs).toEqual([{ id: 1, action: 'create' }]); // Logs preserved
      expect(state.loading).toBe(true); // Loading state preserved
    });
  });
});
