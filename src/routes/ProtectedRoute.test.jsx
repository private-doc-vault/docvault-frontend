import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter, MemoryRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import ProtectedRoute from './ProtectedRoute';
import authReducer from '../features/auth/authSlice';
import tokenManager from '../utils/tokenManager';

// Mock tokenManager
jest.mock('../utils/tokenManager', () => ({
  hasTokens: jest.fn(),
  getUser: jest.fn(),
}));

// Helper function to create a mock store
const createMockStore = (authState = {}) => {
  return configureStore({
    reducer: {
      auth: authReducer,
    },
    preloadedState: {
      auth: {
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        loading: false,
        error: null,
        ...authState,
      },
    },
  });
};

// Helper to render component with router and redux
const renderProtectedRoute = (
  children,
  { store, initialEntries = ['/protected'], requiredRoles = [] } = {}
) => {
  const mockStore = store || createMockStore();

  return render(
    <Provider store={mockStore}>
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route
            path="/protected"
            element={
              <ProtectedRoute requiredRoles={requiredRoles}>
                {children}
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Login Page</div>} />
          <Route path="/unauthorized" element={<div>Unauthorized Page</div>} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );
};

describe('ProtectedRoute', () => {
  const mockUser = {
    id: '123',
    username: 'testuser',
    email: 'test@example.com',
    roles: ['ROLE_USER'],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('authentication checks', () => {
    it('should render children when user is authenticated in Redux', () => {
      tokenManager.hasTokens.mockReturnValue(true);

      const store = createMockStore({
        isAuthenticated: true,
        user: mockUser,
        accessToken: 'mock-token',
      });

      renderProtectedRoute(<div>Protected Content</div>, { store });

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('should render children when user has stored tokens (even if not in Redux)', () => {
      tokenManager.hasTokens.mockReturnValue(true);

      const store = createMockStore({
        isAuthenticated: false,
      });

      renderProtectedRoute(<div>Protected Content</div>, { store });

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('should redirect to login when not authenticated', async () => {
      tokenManager.hasTokens.mockReturnValue(false);

      const store = createMockStore({
        isAuthenticated: false,
      });

      renderProtectedRoute(<div>Protected Content</div>, { store });

      await waitFor(() => {
        expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
        expect(screen.getByText('Login Page')).toBeInTheDocument();
      });
    });
  });

  describe('role-based access control', () => {
    it('should render children when user has required role', () => {
      tokenManager.hasTokens.mockReturnValue(true);
      tokenManager.getUser.mockReturnValue({
        ...mockUser,
        roles: ['ROLE_ADMIN', 'ROLE_USER'],
      });

      const store = createMockStore({
        isAuthenticated: true,
        user: mockUser,
      });

      renderProtectedRoute(<div>Admin Content</div>, {
        store,
        requiredRoles: ['ROLE_ADMIN'],
      });

      expect(screen.getByText('Admin Content')).toBeInTheDocument();
    });

    it('should render children when user has one of multiple required roles', () => {
      tokenManager.hasTokens.mockReturnValue(true);
      tokenManager.getUser.mockReturnValue({
        ...mockUser,
        roles: ['ROLE_USER'],
      });

      const store = createMockStore({
        isAuthenticated: true,
        user: mockUser,
      });

      renderProtectedRoute(<div>User Content</div>, {
        store,
        requiredRoles: ['ROLE_ADMIN', 'ROLE_USER'],
      });

      expect(screen.getByText('User Content')).toBeInTheDocument();
    });

    it('should redirect to unauthorized when user lacks required role', async () => {
      tokenManager.hasTokens.mockReturnValue(true);
      tokenManager.getUser.mockReturnValue({
        ...mockUser,
        roles: ['ROLE_USER'],
      });

      const store = createMockStore({
        isAuthenticated: true,
        user: mockUser,
      });

      renderProtectedRoute(<div>Admin Content</div>, {
        store,
        requiredRoles: ['ROLE_ADMIN'],
      });

      await waitFor(() => {
        expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
        expect(screen.getByText('Unauthorized Page')).toBeInTheDocument();
      });
    });

    it('should handle user with no roles', async () => {
      tokenManager.hasTokens.mockReturnValue(true);
      tokenManager.getUser.mockReturnValue({
        ...mockUser,
        roles: [],
      });

      const store = createMockStore({
        isAuthenticated: true,
        user: mockUser,
      });

      renderProtectedRoute(<div>Admin Content</div>, {
        store,
        requiredRoles: ['ROLE_ADMIN'],
      });

      await waitFor(() => {
        expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
        expect(screen.getByText('Unauthorized Page')).toBeInTheDocument();
      });
    });

    it('should render children when no required roles are specified', () => {
      tokenManager.hasTokens.mockReturnValue(true);

      const store = createMockStore({
        isAuthenticated: true,
        user: mockUser,
      });

      renderProtectedRoute(<div>Any User Content</div>, { store });

      expect(screen.getByText('Any User Content')).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('should handle undefined user roles gracefully', async () => {
      tokenManager.hasTokens.mockReturnValue(true);
      tokenManager.getUser.mockReturnValue({
        id: '123',
        username: 'testuser',
        // roles is undefined
      });

      const store = createMockStore({
        isAuthenticated: true,
        user: mockUser,
      });

      renderProtectedRoute(<div>Admin Content</div>, {
        store,
        requiredRoles: ['ROLE_ADMIN'],
      });

      await waitFor(() => {
        expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
        expect(screen.getByText('Unauthorized Page')).toBeInTheDocument();
      });
    });

    it('should handle null user from tokenManager', async () => {
      tokenManager.hasTokens.mockReturnValue(true);
      tokenManager.getUser.mockReturnValue(null);

      const store = createMockStore({
        isAuthenticated: true,
      });

      renderProtectedRoute(<div>Admin Content</div>, {
        store,
        requiredRoles: ['ROLE_ADMIN'],
      });

      await waitFor(() => {
        expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
        expect(screen.getByText('Unauthorized Page')).toBeInTheDocument();
      });
    });

    it('should handle empty requiredRoles array', () => {
      tokenManager.hasTokens.mockReturnValue(true);

      const store = createMockStore({
        isAuthenticated: true,
        user: mockUser,
      });

      renderProtectedRoute(<div>Content</div>, {
        store,
        requiredRoles: [],
      });

      expect(screen.getByText('Content')).toBeInTheDocument();
    });
  });

  describe('multiple children', () => {
    it('should render multiple children when authenticated', () => {
      tokenManager.hasTokens.mockReturnValue(true);

      const store = createMockStore({
        isAuthenticated: true,
        user: mockUser,
      });

      renderProtectedRoute(
        <>
          <div>First Child</div>
          <div>Second Child</div>
        </>,
        { store }
      );

      expect(screen.getByText('First Child')).toBeInTheDocument();
      expect(screen.getByText('Second Child')).toBeInTheDocument();
    });
  });
});
