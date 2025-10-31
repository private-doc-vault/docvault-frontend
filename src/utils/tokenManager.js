// Token storage keys
const ACCESS_TOKEN_KEY = 'docvault_access_token';
const REFRESH_TOKEN_KEY = 'docvault_refresh_token';
const USER_KEY = 'docvault_user';

/**
 * Token Manager for handling JWT tokens in localStorage
 */
const tokenManager = {
  /**
   * Store access token
   * @param {string} token - JWT access token
   */
  setAccessToken: (token) => {
    if (token) {
      localStorage.setItem(ACCESS_TOKEN_KEY, token);
    }
  },

  /**
   * Get access token
   * @returns {string|null} JWT access token
   */
  getAccessToken: () => {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  /**
   * Store refresh token
   * @param {string} token - JWT refresh token
   */
  setRefreshToken: (token) => {
    if (token) {
      localStorage.setItem(REFRESH_TOKEN_KEY, token);
    }
  },

  /**
   * Get refresh token
   * @returns {string|null} JWT refresh token
   */
  getRefreshToken: () => {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  /**
   * Store both access and refresh tokens
   * @param {string} accessToken - JWT access token
   * @param {string} refreshToken - JWT refresh token
   */
  setTokens: (accessToken, refreshToken) => {
    tokenManager.setAccessToken(accessToken);
    tokenManager.setRefreshToken(refreshToken);
  },

  /**
   * Store user data
   * @param {object} user - User object
   */
  setUser: (user) => {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  },

  /**
   * Get user data
   * @returns {object|null} User object
   */
  getUser: () => {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  },

  /**
   * Clear all tokens and user data
   */
  clearTokens: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  /**
   * Check if user has valid tokens stored
   * @returns {boolean} True if tokens exist
   */
  hasTokens: () => {
    return !!(
      localStorage.getItem(ACCESS_TOKEN_KEY) &&
      localStorage.getItem(REFRESH_TOKEN_KEY)
    );
  },

  /**
   * Decode JWT token to get payload
   * @param {string} token - JWT token
   * @returns {object|null} Decoded payload
   */
  decodeToken: (token) => {
    if (!token) return null;
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  },

  /**
   * Check if token is expired
   * @param {string} token - JWT token
   * @returns {boolean} True if token is expired
   */
  isTokenExpired: (token) => {
    const decoded = tokenManager.decodeToken(token);
    if (!decoded || !decoded.exp) return true;

    // Check if token is expired (with 30 second buffer)
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime + 30;
  },

  /**
   * Check if access token needs refresh
   * @returns {boolean} True if access token is expired or about to expire
   */
  needsRefresh: () => {
    const accessToken = tokenManager.getAccessToken();
    return !accessToken || tokenManager.isTokenExpired(accessToken);
  },
};

export default tokenManager;
