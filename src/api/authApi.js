import apiClient from './apiClient';
import tokenManager from '../utils/tokenManager';

/**
 * Authentication API methods
 */
const authApi = {
  /**
   * Login user with credentials
   * @param {object} credentials - User credentials
   * @param {string} credentials.email - User email
   * @param {string} credentials.password - User password
   * @returns {Promise<object>} User data and tokens
   */
  login: async (credentials) => {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      const { user, token, refresh_token } = response.data;

      // Store tokens and user data
      tokenManager.setTokens(token, refresh_token);
      tokenManager.setUser(user);

      // Return normalized response for consistency
      return {
        user,
        accessToken: token,
        refreshToken: refresh_token,
      };
    } catch (error) {
      throw error;
    }
  },

  /**
   * Logout user and clear tokens
   * @returns {Promise<void>}
   */
  logout: async () => {
    try {
      // Call logout endpoint (optional - depends on backend implementation)
      await apiClient.post('/auth/logout');
    } catch (error) {
      // Continue with logout even if API call fails
      console.error('Logout API call failed:', error);
    } finally {
      // Always clear tokens locally
      tokenManager.clearTokens();
    }
  },

  /**
   * Refresh access token using refresh token
   * @returns {Promise<object>} New tokens
   */
  refresh: async () => {
    try {
      const refreshToken = tokenManager.getRefreshToken();

      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await apiClient.post('/auth/refresh', {
        refresh_token: refreshToken,
      });

      const { token, refresh_token: newRefreshToken } = response.data;

      // Store new tokens
      tokenManager.setAccessToken(token);
      if (newRefreshToken) {
        tokenManager.setRefreshToken(newRefreshToken);
      }

      // Return normalized response for consistency
      return {
        accessToken: token,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      // Clear tokens on refresh failure
      tokenManager.clearTokens();
      throw error;
    }
  },

  /**
   * Register new user
   * @param {object} userData - User registration data
   * @param {string} userData.email - Email address
   * @param {string} userData.password - Password
   * @param {string} userData.firstName - First name (optional)
   * @param {string} userData.lastName - Last name (optional)
   * @returns {Promise<object>} User data and tokens
   */
  register: async (userData) => {
    try {
      const response = await apiClient.post('/auth/register', userData);

      // Note: Backend register endpoint only returns user data, not tokens
      // User needs to login after registration
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get current authenticated user
   * @returns {Promise<object>} User data
   */
  getCurrentUser: async () => {
    try {
      const response = await apiClient.get('/auth/me');
      const { user } = response.data;

      // Update stored user data
      tokenManager.setUser(user);

      return user;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Request password reset
   * @param {string} email - User email
   * @returns {Promise<object>} Success message
   */
  requestPasswordReset: async (email) => {
    try {
      const response = await apiClient.post('/auth/password-reset/request', {
        email,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Reset password with token
   * @param {object} data - Reset data
   * @param {string} data.token - Reset token
   * @param {string} data.password - New password
   * @returns {Promise<object>} Success message
   */
  resetPassword: async (data) => {
    try {
      const response = await apiClient.post('/auth/password-reset/reset', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Change password for authenticated user
   * @param {object} data - Password change data
   * @param {string} data.currentPassword - Current password
   * @param {string} data.newPassword - New password
   * @returns {Promise<object>} Success message
   */
  changePassword: async (data) => {
    try {
      const response = await apiClient.post('/auth/change-password', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default authApi;
