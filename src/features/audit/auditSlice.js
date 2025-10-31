import { createSlice } from '@reduxjs/toolkit';

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

const auditSlice = createSlice({
  name: 'audit',
  initialState,
  reducers: {
    setLogs: (state, action) => {
      state.logs = action.payload;
      state.loading = false;
      state.error = null;
    },
    setFilters: (state, action) => {
      state.filters = {
        ...state.filters,
        ...action.payload,
      };
      // Reset to first page when filters change
      state.pagination.currentPage = 1;
    },
    setPagination: (state, action) => {
      state.pagination = {
        ...state.pagination,
        ...action.payload,
      };
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
      state.pagination.currentPage = 1;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setLogs,
  setFilters,
  setPagination,
  setLoading,
  setError,
  clearFilters,
  clearError,
} = auditSlice.actions;

// Selectors
export const selectLogs = (state) => state.audit.logs;
export const selectFilters = (state) => state.audit.filters;
export const selectPagination = (state) => state.audit.pagination;
export const selectLoading = (state) => state.audit.loading;
export const selectError = (state) => state.audit.error;

export default auditSlice.reducer;
