import { useDispatch, useSelector } from 'react-redux';
import { useCallback } from 'react';
import {
  setCredentials,
  setUser,
  refreshTokens,
  logout as logoutAction,
  setLoading,
  setError,
  selectCurrentUser,
  selectAccessToken,
  selectRefreshToken,
  selectIsAuthenticated,
  selectAuthLoading,
  selectAuthError,
} from '../features/auth/authSlice';
import authApi from '../api/authApi';
import tokenManager from '../utils/tokenManager';

/**
 * Custom hook for authentication
 * Provides access to auth state and actions
 */
const useAuth = () => {
  const dispatch = useDispatch();

  // Select auth state from Redux store
  const user = useSelector(selectCurrentUser);
  const accessToken = useSelector(selectAccessToken);
  const refreshToken = useSelector(selectRefreshToken);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);

  /**
   * Login user with credentials
   * @param {object} credentials - User credentials
   */
  const login = useCallback(
    async (credentials) => {
      try {
        dispatch(setLoading(true));
        const data = await authApi.login(credentials);
        dispatch(
          setCredentials({
            user: data.user,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
          })
        );
        dispatch(setLoading(false));
        return data;
      } catch (err) {
        const errorMessage =
          err.response?.data?.error ||
          err.response?.data?.message ||
          'Login failed. Please try again.';
        dispatch(setError(errorMessage));
        dispatch(setLoading(false));
        throw err;
      }
    },
    [dispatch]
  );

  /**
   * Register new user
   * Note: Backend returns user data only, not tokens
   * User needs to login after registration
   * @param {object} userData - User registration data
   */
  const register = useCallback(
    async (userData) => {
      try {
        dispatch(setLoading(true));
        const data = await authApi.register(userData);
        dispatch(setLoading(false));
        return data;
      } catch (err) {
        const errorMessage =
          err.response?.data?.error ||
          err.response?.data?.message ||
          'Registration failed. Please try again.';
        dispatch(setError(errorMessage));
        dispatch(setLoading(false));
        throw err;
      }
    },
    [dispatch]
  );

  /**
   * Logout user
   */
  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      dispatch(logoutAction());
    }
  }, [dispatch]);

  /**
   * Refresh authentication tokens
   */
  const refresh = useCallback(async () => {
    try {
      const data = await authApi.refresh();
      dispatch(
        refreshTokens({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        })
      );
      return data;
    } catch (err) {
      dispatch(logoutAction());
      throw err;
    }
  }, [dispatch]);

  /**
   * Update current user data
   * @param {object} userData - Updated user data
   */
  const updateUser = useCallback(
    (userData) => {
      dispatch(setUser(userData));
      tokenManager.setUser(userData);
    },
    [dispatch]
  );

  /**
   * Fetch current user from API
   */
  const fetchCurrentUser = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      const userData = await authApi.getCurrentUser();
      dispatch(setUser(userData));
      dispatch(setLoading(false));
      return userData;
    } catch (err) {
      dispatch(setError(err.response?.data?.message || 'Failed to fetch user'));
      throw err;
    }
  }, [dispatch]);

  /**
   * Clear auth error
   */
  const clearError = useCallback(() => {
    dispatch(setError(null));
  }, [dispatch]);

  /**
   * Initialize auth state from localStorage
   */
  const initializeAuth = useCallback(() => {
    const storedUser = tokenManager.getUser();
    const storedAccessToken = tokenManager.getAccessToken();
    const storedRefreshToken = tokenManager.getRefreshToken();

    if (storedUser && storedAccessToken && storedRefreshToken) {
      // Check if token is expired
      if (tokenManager.isTokenExpired(storedAccessToken)) {
        // Token is expired, try to refresh
        refresh().catch(() => {
          // If refresh fails, clear tokens
          tokenManager.clearTokens();
        });
      } else {
        // Token is valid, restore auth state
        dispatch(
          setCredentials({
            user: storedUser,
            accessToken: storedAccessToken,
            refreshToken: storedRefreshToken,
          })
        );
      }
    }
  }, [dispatch, refresh]);

  return {
    // State
    user,
    accessToken,
    refreshToken,
    isAuthenticated,
    loading,
    error,
    // Actions
    login,
    register,
    logout,
    refresh,
    updateUser,
    fetchCurrentUser,
    clearError,
    initializeAuth,
  };
};

export default useAuth;
