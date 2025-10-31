import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  metrics: {
    totalDocuments: 0,
    processedToday: 0,
    activeUsers: 0,
    storageUsed: 0,
  },
  systemHealth: {
    status: 'unknown', // 'healthy', 'degraded', 'down', 'unknown'
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
    failedTasks: [], // Array of { id, filename, error, timestamp }
  },
  recentErrors: [], // Array of { id, type, message, timestamp, details }
  loading: false,
  error: null,
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setMetrics: (state, action) => {
      state.metrics = {
        ...state.metrics,
        ...action.payload,
      };
    },
    setSystemHealth: (state, action) => {
      state.systemHealth = {
        ...state.systemHealth,
        ...action.payload,
        lastChecked: new Date().toISOString(),
      };
    },
    setQueueStatus: (state, action) => {
      state.queueStatus = {
        ...state.queueStatus,
        ...action.payload,
      };
    },
    setRecentErrors: (state, action) => {
      state.recentErrors = action.payload;
    },
    addRecentError: (state, action) => {
      state.recentErrors.unshift(action.payload);
      // Keep only last 10 errors
      if (state.recentErrors.length > 10) {
        state.recentErrors = state.recentErrors.slice(0, 10);
      }
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetDashboard: () => initialState,
  },
});

export const {
  setMetrics,
  setSystemHealth,
  setQueueStatus,
  setRecentErrors,
  addRecentError,
  setLoading,
  setError,
  clearError,
  resetDashboard,
} = dashboardSlice.actions;

// Selectors
export const selectMetrics = (state) => state.dashboard.metrics;
export const selectSystemHealth = (state) => state.dashboard.systemHealth;
export const selectQueueStatus = (state) => state.dashboard.queueStatus;
export const selectRecentErrors = (state) => state.dashboard.recentErrors;
export const selectLoading = (state) => state.dashboard.loading;
export const selectError = (state) => state.dashboard.error;

// Computed selectors
export const selectIsSystemHealthy = (state) => {
  const { systemHealth } = state.dashboard;
  return systemHealth.status === 'healthy';
};

export const selectHasFailedTasks = (state) => {
  const { queueStatus } = state.dashboard;
  return queueStatus.failed > 0 || queueStatus.failedTasks.length > 0;
};

export default dashboardSlice.reducer;
