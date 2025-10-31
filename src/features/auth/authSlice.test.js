import authReducer, {
  setCredentials,
  setUser,
  refreshTokens,
  logout,
  setLoading,
  setError,
  selectCurrentUser,
  selectAccessToken,
  selectRefreshToken,
  selectIsAuthenticated,
  selectAuthLoading,
  selectAuthError,
} from './authSlice';

describe('authSlice', () => {
  const initialState = {
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  };

  const mockUser = {
    id: '123',
    username: 'testuser',
    email: 'test@example.com',
    roles: ['ROLE_USER'],
  };

  const mockTokens = {
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
  };

  describe('reducers', () => {
    it('should return the initial state', () => {
      expect(authReducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });

    it('should handle setCredentials', () => {
      const payload = {
        user: mockUser,
        accessToken: mockTokens.accessToken,
        refreshToken: mockTokens.refreshToken,
      };

      const actual = authReducer(initialState, setCredentials(payload));

      expect(actual.user).toEqual(mockUser);
      expect(actual.accessToken).toEqual(mockTokens.accessToken);
      expect(actual.refreshToken).toEqual(mockTokens.refreshToken);
      expect(actual.isAuthenticated).toBe(true);
      expect(actual.error).toBeNull();
    });

    it('should handle setUser', () => {
      const actual = authReducer(initialState, setUser(mockUser));

      expect(actual.user).toEqual(mockUser);
    });

    it('should handle refreshTokens with new access token', () => {
      const state = {
        ...initialState,
        user: mockUser,
        accessToken: 'old-access-token',
        refreshToken: 'old-refresh-token',
        isAuthenticated: true,
      };

      const newTokens = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      };

      const actual = authReducer(state, refreshTokens(newTokens));

      expect(actual.accessToken).toEqual(newTokens.accessToken);
      expect(actual.refreshToken).toEqual(newTokens.refreshToken);
      expect(actual.user).toEqual(mockUser);
      expect(actual.isAuthenticated).toBe(true);
    });

    it('should handle refreshTokens with only access token (refresh token optional)', () => {
      const state = {
        ...initialState,
        user: mockUser,
        accessToken: 'old-access-token',
        refreshToken: 'old-refresh-token',
        isAuthenticated: true,
      };

      const newTokens = {
        accessToken: 'new-access-token',
      };

      const actual = authReducer(state, refreshTokens(newTokens));

      expect(actual.accessToken).toEqual(newTokens.accessToken);
      expect(actual.refreshToken).toEqual('old-refresh-token'); // Should keep old refresh token
      expect(actual.user).toEqual(mockUser);
    });

    it('should handle logout', () => {
      const state = {
        user: mockUser,
        accessToken: mockTokens.accessToken,
        refreshToken: mockTokens.refreshToken,
        isAuthenticated: true,
        loading: false,
        error: null,
      };

      const actual = authReducer(state, logout());

      expect(actual).toEqual(initialState);
    });

    it('should handle setLoading', () => {
      const actual = authReducer(initialState, setLoading(true));

      expect(actual.loading).toBe(true);
    });

    it('should handle setError', () => {
      const errorMessage = 'Login failed';
      const actual = authReducer(initialState, setError(errorMessage));

      expect(actual.error).toEqual(errorMessage);
      expect(actual.loading).toBe(false);
    });
  });

  describe('selectors', () => {
    const mockState = {
      auth: {
        user: mockUser,
        accessToken: mockTokens.accessToken,
        refreshToken: mockTokens.refreshToken,
        isAuthenticated: true,
        loading: false,
        error: 'Test error',
      },
    };

    it('should select current user', () => {
      expect(selectCurrentUser(mockState)).toEqual(mockUser);
    });

    it('should select access token', () => {
      expect(selectAccessToken(mockState)).toEqual(mockTokens.accessToken);
    });

    it('should select refresh token', () => {
      expect(selectRefreshToken(mockState)).toEqual(mockTokens.refreshToken);
    });

    it('should select isAuthenticated', () => {
      expect(selectIsAuthenticated(mockState)).toBe(true);
    });

    it('should select loading state', () => {
      expect(selectAuthLoading(mockState)).toBe(false);
    });

    it('should select error', () => {
      expect(selectAuthError(mockState)).toEqual('Test error');
    });
  });

  describe('authentication flow', () => {
    it('should handle complete login flow', () => {
      // Start with initial state
      let state = initialState;

      // Set loading
      state = authReducer(state, setLoading(true));
      expect(state.loading).toBe(true);

      // Set credentials on successful login
      const credentials = {
        user: mockUser,
        accessToken: mockTokens.accessToken,
        refreshToken: mockTokens.refreshToken,
      };
      state = authReducer(state, setCredentials(credentials));

      expect(state.user).toEqual(mockUser);
      expect(state.accessToken).toEqual(mockTokens.accessToken);
      expect(state.refreshToken).toEqual(mockTokens.refreshToken);
      expect(state.isAuthenticated).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should handle complete logout flow', () => {
      // Start with authenticated state
      let state = {
        user: mockUser,
        accessToken: mockTokens.accessToken,
        refreshToken: mockTokens.refreshToken,
        isAuthenticated: true,
        loading: false,
        error: null,
      };

      // Logout
      state = authReducer(state, logout());

      expect(state).toEqual(initialState);
    });

    it('should handle token refresh flow', () => {
      // Start with authenticated state
      let state = {
        user: mockUser,
        accessToken: 'old-token',
        refreshToken: 'old-refresh',
        isAuthenticated: true,
        loading: false,
        error: null,
      };

      // Refresh tokens
      const newTokens = {
        accessToken: 'new-token',
        refreshToken: 'new-refresh',
      };
      state = authReducer(state, refreshTokens(newTokens));

      expect(state.accessToken).toEqual('new-token');
      expect(state.refreshToken).toEqual('new-refresh');
      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);
    });
  });
});
