import apiClient from './apiClient';

/**
 * Fetch dashboard metrics (total documents, processed today, active users, storage used)
 * @returns {Promise<Object>} Dashboard metrics data
 */
export const fetchDashboardMetrics = async () => {
  try {
    const response = await apiClient.get('/api/admin/dashboard');
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    throw error;
  }
};

/**
 * Fetch system health status (backend, database, Redis, Meilisearch, OCR service)
 * @returns {Promise<Object>} System health status data
 */
export const fetchSystemStatus = async () => {
  try {
    const response = await apiClient.get('/api/admin/system-status');
    return response.data;
  } catch (error) {
    console.error('Error fetching system status:', error);
    throw error;
  }
};

/**
 * Fetch OCR queue statistics (pending, processing, failed tasks)
 * @returns {Promise<Object>} Queue status data
 */
export const fetchQueueStatus = async () => {
  try {
    const response = await apiClient.get('/api/admin/queue-status');
    return response.data;
  } catch (error) {
    console.error('Error fetching queue status:', error);
    throw error;
  }
};

/**
 * Retry a stuck or failed OCR processing task
 * @param {number} documentId - Document ID to retry
 * @returns {Promise<Object>} Retry result
 */
export const retryStuckTask = async (documentId) => {
  try {
    const response = await apiClient.post(
      `/api/documents/${documentId}/retry-processing`
    );
    return response.data;
  } catch (error) {
    console.error(`Error retrying task for document ${documentId}:`, error);
    throw error;
  }
};

/**
 * Cancel a processing task (if backend supports it)
 * @param {number} documentId - Document ID to cancel
 * @returns {Promise<Object>} Cancel result
 */
export const cancelTask = async (documentId) => {
  try {
    const response = await apiClient.post(
      `/api/documents/${documentId}/cancel-processing`
    );
    return response.data;
  } catch (error) {
    console.error(`Error canceling task for document ${documentId}:`, error);
    throw error;
  }
};

/**
 * Fetch activity chart data (documents processed per day)
 * @param {number} days - Number of days to fetch (default: 7)
 * @returns {Promise<Array>} Activity data by day
 */
export const fetchActivityData = async (days = 7) => {
  try {
    const response = await apiClient.get(`/api/admin/activity?days=${days}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching activity data:', error);
    throw error;
  }
};

/**
 * Fetch user activity data over time
 * @param {number} days - Number of days to fetch (default: 7)
 * @returns {Promise<Array>} User activity data
 */
export const fetchUserActivityData = async (days = 7) => {
  try {
    const response = await apiClient.get(
      `/api/admin/user-activity?days=${days}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching user activity data:', error);
    throw error;
  }
};

/**
 * Fetch storage usage trend data
 * @param {number} days - Number of days to fetch (default: 30)
 * @returns {Promise<Array>} Storage usage trend data
 */
export const fetchStorageUsageTrend = async (days = 30) => {
  try {
    const response = await apiClient.get(
      `/api/admin/storage-usage?days=${days}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching storage usage trend:', error);
    throw error;
  }
};

/**
 * Fetch recent errors and warnings
 * @param {number} limit - Maximum number of errors to fetch (default: 10)
 * @returns {Promise<Array>} Recent errors
 */
export const fetchRecentErrors = async (limit = 10) => {
  try {
    const response = await apiClient.get(
      `/api/admin/recent-errors?limit=${limit}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching recent errors:', error);
    throw error;
  }
};

export default {
  fetchDashboardMetrics,
  fetchSystemStatus,
  fetchQueueStatus,
  retryStuckTask,
  cancelTask,
  fetchActivityData,
  fetchUserActivityData,
  fetchStorageUsageTrend,
  fetchRecentErrors,
};
