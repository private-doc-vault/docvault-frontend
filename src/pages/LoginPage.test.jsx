import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import LoginPage from './LoginPage';
import authReducer from '../features/auth/authSlice';
import authApi from '../api/authApi';

// Mock authApi
jest.mock('../api/authApi');

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
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
const renderLoginPage = (store, initialEntries = ['/login']) => {
  const mockStore = store || createMockStore();

  return render(
    <Provider store={mockStore}>
      <MemoryRouter initialEntries={initialEntries}>
        <LoginPage />
      </MemoryRouter>
    </Provider>
  );
};

describe('LoginPage Integration Tests', () => {
  const mockUser = {
    id: '123',
    username: 'testuser',
    email: 'test@example.com',
    roles: ['ROLE_USER'],
  };

  const mockCredentials = {
    email: 'test@example.com',
    password: 'password123',
  };

  const mockTokens = {
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render login form with all elements', () => {
      renderLoginPage();

      expect(screen.getByText('DocVault')).toBeInTheDocument();
      expect(screen.getByText('Sign in to your account')).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /sign in/i })
      ).toBeInTheDocument();
      expect(screen.getByText(/don't have an account/i)).toBeInTheDocument();
      expect(screen.getByText(/forgot password/i)).toBeInTheDocument();
    });

    it('should auto-focus on email field', () => {
      renderLoginPage();

      const emailInput = screen.getByLabelText(/email/i);
      expect(emailInput).toHaveFocus();
    });
  });

  describe('Form Validation', () => {
    it('should show validation error for empty email', async () => {
      const user = userEvent.setup();
      renderLoginPage();

      const emailInput = screen.getByLabelText(/email/i);

      // Focus and blur email without entering value
      await user.click(emailInput);
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      });
    });

    it('should show validation error for invalid email', async () => {
      const user = userEvent.setup();
      renderLoginPage();

      const emailInput = screen.getByLabelText(/email/i);

      await user.type(emailInput, 'invalid-email');
      await user.tab();

      await waitFor(() => {
        expect(
          screen.getByText(/please enter a valid email address/i)
        ).toBeInTheDocument();
      });
    });

    it('should show validation error for empty password', async () => {
      const user = userEvent.setup();
      renderLoginPage();

      const passwordInput = screen.getByLabelText(/password/i);

      await user.click(passwordInput);
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      });
    });

    it('should show validation error for short password', async () => {
      const user = userEvent.setup();
      renderLoginPage();

      const passwordInput = screen.getByLabelText(/password/i);

      await user.type(passwordInput, '12345');
      await user.tab();

      await waitFor(() => {
        expect(
          screen.getByText(/password must be at least 6 characters/i)
        ).toBeInTheDocument();
      });
    });

    it('should not show validation errors when inputs are valid', async () => {
      const user = userEvent.setup();
      renderLoginPage();

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);

      await user.type(emailInput, mockCredentials.email);
      await user.type(passwordInput, mockCredentials.password);

      expect(screen.queryByText(/is required/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/must be at least/i)).not.toBeInTheDocument();
    });
  });

  describe('Successful Login Flow', () => {
    it('should successfully login with valid credentials', async () => {
      const user = userEvent.setup();
      const store = createMockStore();

      authApi.login.mockResolvedValue({
        user: mockUser,
        accessToken: mockTokens.accessToken,
        refreshToken: mockTokens.refreshToken,
      });

      renderLoginPage(store);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      // Fill in form
      await user.type(emailInput, mockCredentials.email);
      await user.type(passwordInput, mockCredentials.password);

      // Submit form
      await user.click(submitButton);

      // Wait for API call
      await waitFor(() => {
        expect(authApi.login).toHaveBeenCalledWith({
          email: mockCredentials.email,
          password: mockCredentials.password,
        });
      });

      // Check Redux state was updated
      const state = store.getState();
      expect(state.auth.isAuthenticated).toBe(true);
      expect(state.auth.user).toEqual(mockUser);
      expect(state.auth.accessToken).toEqual(mockTokens.accessToken);
    });

    it('should disable form during submission', async () => {
      const user = userEvent.setup();
      authApi.login.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      renderLoginPage();

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, mockCredentials.email);
      await user.type(passwordInput, mockCredentials.password);
      await user.click(submitButton);

      // Button should show loading state
      expect(
        screen.getByRole('button', { name: /signing in/i })
      ).toBeInTheDocument();

      // Inputs should be disabled
      expect(emailInput).toBeDisabled();
      expect(passwordInput).toBeDisabled();
    });

    it('should show loading state on submit button', async () => {
      const user = userEvent.setup();
      authApi.login.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      renderLoginPage();

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, mockCredentials.email);
      await user.type(passwordInput, mockCredentials.password);
      await user.click(submitButton);

      expect(
        screen.getByRole('button', { name: /signing in/i })
      ).toBeInTheDocument();
    });
  });

  describe('Failed Login Flow', () => {
    it('should display error message on login failure', async () => {
      const user = userEvent.setup();
      const store = createMockStore();
      const errorMessage = 'Invalid credentials';

      authApi.login.mockRejectedValue({
        response: {
          data: {
            error: errorMessage,
          },
        },
      });

      renderLoginPage(store);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, mockCredentials.email);
      await user.type(passwordInput, mockCredentials.password);
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });

    it('should display generic error message when no specific error provided', async () => {
      const user = userEvent.setup();
      const store = createMockStore();

      authApi.login.mockRejectedValue(new Error('Network error'));

      renderLoginPage(store);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, mockCredentials.email);
      await user.type(passwordInput, mockCredentials.password);
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/login failed. please try again/i)
        ).toBeInTheDocument();
      });
    });

    it('should allow dismissing error alert', async () => {
      const user = userEvent.setup();
      const store = createMockStore();

      authApi.login.mockRejectedValue({
        response: {
          data: {
            error: 'Login error',
          },
        },
      });

      renderLoginPage(store);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, mockCredentials.email);
      await user.type(passwordInput, mockCredentials.password);
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Login error')).toBeInTheDocument();
      });

      // Dismiss the alert
      const closeButton = screen.getByRole('button', { name: /close/i });
      await user.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByText('Login error')).not.toBeInTheDocument();
      });
    });

    it('should re-enable form after failed login', async () => {
      const user = userEvent.setup();
      authApi.login.mockRejectedValue(new Error('Login failed'));

      renderLoginPage();

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, mockCredentials.email);
      await user.type(passwordInput, mockCredentials.password);
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/login failed/i)).toBeInTheDocument();
      });

      // Form should be re-enabled
      expect(emailInput).not.toBeDisabled();
      expect(passwordInput).not.toBeDisabled();
      expect(submitButton).not.toBeDisabled();
    });
  });

  describe('Form Submission', () => {
    it('should submit form on Enter key press', async () => {
      const user = userEvent.setup();
      authApi.login.mockResolvedValue({
        user: mockUser,
        accessToken: mockTokens.accessToken,
        refreshToken: mockTokens.refreshToken,
      });

      renderLoginPage();

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);

      await user.type(emailInput, mockCredentials.email);
      await user.type(passwordInput, mockCredentials.password);
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(authApi.login).toHaveBeenCalled();
      });
    });

    it('should not submit form with validation errors', async () => {
      const user = userEvent.setup();
      renderLoginPage();

      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.click(submitButton);

      // API should not be called
      expect(authApi.login).not.toHaveBeenCalled();
    });
  });

  describe('Navigation Links', () => {
    it('should render link to registration page', () => {
      renderLoginPage();

      const signUpLink = screen.getByText('Sign up');
      expect(signUpLink).toBeInTheDocument();
      expect(signUpLink).toHaveAttribute('href', '/register');
    });

    it('should render link to forgot password page', () => {
      renderLoginPage();

      const forgotPasswordLink = screen.getByText('Forgot password?');
      expect(forgotPasswordLink).toBeInTheDocument();
      expect(forgotPasswordLink).toHaveAttribute('href', '/forgot-password');
    });
  });
});
