import tokenManager from './tokenManager';

describe('tokenManager', () => {
  // Mock localStorage
  const localStorageMock = (() => {
    let store = {};

    return {
      getItem: (key) => store[key] || null,
      setItem: (key, value) => {
        store[key] = value.toString();
      },
      removeItem: (key) => {
        delete store[key];
      },
      clear: () => {
        store = {};
      },
    };
  })();

  // Replace global localStorage with mock
  beforeAll(() => {
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });
  });

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  const mockAccessToken = 'mock-access-token';
  const mockRefreshToken = 'mock-refresh-token';
  const mockUser = {
    id: '123',
    username: 'testuser',
    email: 'test@example.com',
    roles: ['ROLE_USER'],
  };

  describe('setAccessToken and getAccessToken', () => {
    it('should store and retrieve access token', () => {
      tokenManager.setAccessToken(mockAccessToken);
      const token = tokenManager.getAccessToken();

      expect(token).toEqual(mockAccessToken);
    });

    it('should return null if no access token is stored', () => {
      const token = tokenManager.getAccessToken();

      expect(token).toBeNull();
    });

    it('should not store null or undefined access token', () => {
      tokenManager.setAccessToken(null);
      expect(tokenManager.getAccessToken()).toBeNull();

      tokenManager.setAccessToken(undefined);
      expect(tokenManager.getAccessToken()).toBeNull();
    });
  });

  describe('setRefreshToken and getRefreshToken', () => {
    it('should store and retrieve refresh token', () => {
      tokenManager.setRefreshToken(mockRefreshToken);
      const token = tokenManager.getRefreshToken();

      expect(token).toEqual(mockRefreshToken);
    });

    it('should return null if no refresh token is stored', () => {
      const token = tokenManager.getRefreshToken();

      expect(token).toBeNull();
    });

    it('should not store null or undefined refresh token', () => {
      tokenManager.setRefreshToken(null);
      expect(tokenManager.getRefreshToken()).toBeNull();

      tokenManager.setRefreshToken(undefined);
      expect(tokenManager.getRefreshToken()).toBeNull();
    });
  });

  describe('setTokens', () => {
    it('should store both access and refresh tokens', () => {
      tokenManager.setTokens(mockAccessToken, mockRefreshToken);

      expect(tokenManager.getAccessToken()).toEqual(mockAccessToken);
      expect(tokenManager.getRefreshToken()).toEqual(mockRefreshToken);
    });
  });

  describe('setUser and getUser', () => {
    it('should store and retrieve user object', () => {
      tokenManager.setUser(mockUser);
      const user = tokenManager.getUser();

      expect(user).toEqual(mockUser);
    });

    it('should return null if no user is stored', () => {
      const user = tokenManager.getUser();

      expect(user).toBeNull();
    });

    it('should handle invalid JSON gracefully', () => {
      localStorage.setItem('docvault_user', 'invalid-json');

      expect(() => {
        tokenManager.getUser();
      }).toThrow();
    });

    it('should not store null or undefined user', () => {
      tokenManager.setUser(null);
      expect(tokenManager.getUser()).toBeNull();

      tokenManager.setUser(undefined);
      expect(tokenManager.getUser()).toBeNull();
    });
  });

  describe('clearTokens', () => {
    it('should clear all tokens and user data', () => {
      // Set tokens and user
      tokenManager.setTokens(mockAccessToken, mockRefreshToken);
      tokenManager.setUser(mockUser);

      // Verify they are stored
      expect(tokenManager.getAccessToken()).toEqual(mockAccessToken);
      expect(tokenManager.getRefreshToken()).toEqual(mockRefreshToken);
      expect(tokenManager.getUser()).toEqual(mockUser);

      // Clear tokens
      tokenManager.clearTokens();

      // Verify they are cleared
      expect(tokenManager.getAccessToken()).toBeNull();
      expect(tokenManager.getRefreshToken()).toBeNull();
      expect(tokenManager.getUser()).toBeNull();
    });
  });

  describe('hasTokens', () => {
    it('should return true if both tokens exist', () => {
      tokenManager.setTokens(mockAccessToken, mockRefreshToken);

      expect(tokenManager.hasTokens()).toBe(true);
    });

    it('should return false if access token is missing', () => {
      tokenManager.setRefreshToken(mockRefreshToken);

      expect(tokenManager.hasTokens()).toBe(false);
    });

    it('should return false if refresh token is missing', () => {
      tokenManager.setAccessToken(mockAccessToken);

      expect(tokenManager.hasTokens()).toBe(false);
    });

    it('should return false if both tokens are missing', () => {
      expect(tokenManager.hasTokens()).toBe(false);
    });
  });

  describe('decodeToken', () => {
    // Create a mock JWT token
    const createMockToken = (payload) => {
      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const encodedPayload = btoa(JSON.stringify(payload));
      const signature = 'mock-signature';
      return `${header}.${encodedPayload}.${signature}`;
    };

    it('should decode a valid JWT token', () => {
      const payload = { userId: '123', exp: 1234567890 };
      const token = createMockToken(payload);

      const decoded = tokenManager.decodeToken(token);

      expect(decoded).toEqual(payload);
    });

    it('should return null for null token', () => {
      const decoded = tokenManager.decodeToken(null);

      expect(decoded).toBeNull();
    });

    it('should return null for invalid token', () => {
      // Suppress expected console.error for this test
      const consoleError = console.error;
      console.error = jest.fn();

      const decoded = tokenManager.decodeToken('invalid-token');

      expect(decoded).toBeNull();

      // Restore console.error
      console.error = consoleError;
    });
  });

  describe('isTokenExpired', () => {
    const createMockToken = (expirationTime) => {
      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const payload = btoa(JSON.stringify({ exp: expirationTime }));
      const signature = 'mock-signature';
      return `${header}.${payload}.${signature}`;
    };

    it('should return false for valid token (not expired)', () => {
      const futureTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      const token = createMockToken(futureTime);

      expect(tokenManager.isTokenExpired(token)).toBe(false);
    });

    it('should return true for expired token', () => {
      const pastTime = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
      const token = createMockToken(pastTime);

      expect(tokenManager.isTokenExpired(token)).toBe(true);
    });

    it('should return true for token expiring within 30 seconds (buffer)', () => {
      const nearFutureTime = Math.floor(Date.now() / 1000) + 15; // 15 seconds from now
      const token = createMockToken(nearFutureTime);

      expect(tokenManager.isTokenExpired(token)).toBe(true);
    });

    it('should return true for null token', () => {
      expect(tokenManager.isTokenExpired(null)).toBe(true);
    });

    it('should return true for token without exp claim', () => {
      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const payload = btoa(JSON.stringify({ userId: '123' })); // No exp
      const token = `${header}.${payload}.signature`;

      expect(tokenManager.isTokenExpired(token)).toBe(true);
    });
  });

  describe('needsRefresh', () => {
    const createMockToken = (expirationTime) => {
      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const payload = btoa(JSON.stringify({ exp: expirationTime }));
      const signature = 'mock-signature';
      return `${header}.${payload}.${signature}`;
    };

    it('should return false if token is valid and not expired', () => {
      const futureTime = Math.floor(Date.now() / 1000) + 3600;
      const token = createMockToken(futureTime);
      tokenManager.setAccessToken(token);

      expect(tokenManager.needsRefresh()).toBe(false);
    });

    it('should return true if token is expired', () => {
      const pastTime = Math.floor(Date.now() / 1000) - 3600;
      const token = createMockToken(pastTime);
      tokenManager.setAccessToken(token);

      expect(tokenManager.needsRefresh()).toBe(true);
    });

    it('should return true if no access token exists', () => {
      expect(tokenManager.needsRefresh()).toBe(true);
    });
  });

  describe('complete token lifecycle', () => {
    it('should handle complete authentication flow', () => {
      // Login - store tokens and user
      tokenManager.setTokens(mockAccessToken, mockRefreshToken);
      tokenManager.setUser(mockUser);

      // Verify storage
      expect(tokenManager.hasTokens()).toBe(true);
      expect(tokenManager.getAccessToken()).toEqual(mockAccessToken);
      expect(tokenManager.getRefreshToken()).toEqual(mockRefreshToken);
      expect(tokenManager.getUser()).toEqual(mockUser);

      // Refresh - update access token
      const newAccessToken = 'new-access-token';
      tokenManager.setAccessToken(newAccessToken);

      expect(tokenManager.getAccessToken()).toEqual(newAccessToken);
      expect(tokenManager.getRefreshToken()).toEqual(mockRefreshToken); // Unchanged
      expect(tokenManager.getUser()).toEqual(mockUser); // Unchanged

      // Logout - clear everything
      tokenManager.clearTokens();

      expect(tokenManager.hasTokens()).toBe(false);
      expect(tokenManager.getAccessToken()).toBeNull();
      expect(tokenManager.getRefreshToken()).toBeNull();
      expect(tokenManager.getUser()).toBeNull();
    });
  });
});
