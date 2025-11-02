import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import AppNavbar from './Navbar';
import authReducer from '../../features/auth/authSlice';
import ROUTES from '../../routes/routes';

/**
 * Test utility to render Navbar with Redux and Router
 */
const renderNavbar = (initialAuthState = {}) => {
  const store = configureStore({
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
        ...initialAuthState,
      },
    },
  });

  return render(
    <Provider store={store}>
      <BrowserRouter>
        <AppNavbar />
      </BrowserRouter>
    </Provider>
  );
};

describe('Navbar', () => {
  describe('when user is not authenticated', () => {
    it('should render logo/brand', () => {
      renderNavbar();
      const brandLink = screen.getByRole('link', { name: /doc vault/i });
      expect(brandLink).toBeInTheDocument();
    });

    it('should not render navigation links', () => {
      renderNavbar();
      expect(
        screen.queryByRole('link', { name: 'Documents' })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('link', { name: 'Search' })
      ).not.toBeInTheDocument();
    });

    it('should not render search button', () => {
      renderNavbar();
      expect(
        screen.queryByRole('button', { name: /search/i })
      ).not.toBeInTheDocument();
    });

    it('should not render user menu', () => {
      renderNavbar();
      expect(
        screen.queryByRole('button', { name: /user/i })
      ).not.toBeInTheDocument();
    });
  });

  describe('when user is authenticated', () => {
    const authenticatedState = {
      user: { id: 1, username: 'testuser', email: 'test@example.com' },
      accessToken: 'test-token',
      refreshToken: 'test-refresh-token',
      isAuthenticated: true,
    };

    it('should render logo/brand', () => {
      renderNavbar(authenticatedState);
      const brandLink = screen.getByRole('link', { name: /doc vault/i });
      expect(brandLink).toBeInTheDocument();
    });

    it('should render navigation links', () => {
      renderNavbar(authenticatedState);
      expect(
        screen.getByRole('link', { name: 'Documents' })
      ).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Search' })).toBeInTheDocument();
    });

    it('should render search button', () => {
      renderNavbar(authenticatedState);
      expect(
        screen.getByRole('button', { name: /search documents/i })
      ).toBeInTheDocument();
    });

    it('should render user menu with username', () => {
      renderNavbar(authenticatedState);
      expect(
        screen.getByRole('button', { name: /testuser/i })
      ).toBeInTheDocument();
    });

    it('should have correct link to documents page', () => {
      renderNavbar(authenticatedState);
      const documentsLink = screen.getByRole('link', { name: 'Documents' });
      expect(documentsLink).toHaveAttribute('href', ROUTES.DOCUMENTS);
    });

    it('should have correct link to search page', () => {
      renderNavbar(authenticatedState);
      const searchLink = screen.getByRole('link', { name: 'Search' });
      expect(searchLink).toHaveAttribute('href', ROUTES.SEARCH);
    });
  });

  describe('user menu dropdown', () => {
    const authenticatedState = {
      user: { id: 1, username: 'testuser', email: 'test@example.com' },
      accessToken: 'test-token',
      isAuthenticated: true,
    };

    it('should show dropdown when clicked', () => {
      renderNavbar(authenticatedState);

      const userMenuButton = screen.getByRole('button', { name: /testuser/i });
      fireEvent.click(userMenuButton);

      expect(screen.getByRole('link', { name: 'Profile' })).toBeInTheDocument();
      expect(
        screen.getByRole('link', { name: 'Settings' })
      ).toBeInTheDocument();
      expect(screen.getByText('Logout')).toBeInTheDocument();
    });

    it('should have correct link to profile page', () => {
      renderNavbar(authenticatedState);

      const userMenuButton = screen.getByRole('button', { name: /testuser/i });
      fireEvent.click(userMenuButton);

      const profileLink = screen.getByRole('link', { name: 'Profile' });
      expect(profileLink).toHaveAttribute('href', ROUTES.PROFILE);
    });

    it('should have correct link to settings page', () => {
      renderNavbar(authenticatedState);

      const userMenuButton = screen.getByRole('button', { name: /testuser/i });
      fireEvent.click(userMenuButton);

      const settingsLink = screen.getByRole('link', { name: 'Settings' });
      expect(settingsLink).toHaveAttribute('href', ROUTES.SETTINGS);
    });
  });

  describe('brand/logo link', () => {
    it('should link to home page', () => {
      renderNavbar();
      const brandLink = screen.getByRole('link', { name: /doc vault/i });
      expect(brandLink).toHaveAttribute('href', ROUTES.HOME);
    });
  });

  describe('responsive design', () => {
    it('should render navbar toggle button', () => {
      renderNavbar();
      const toggleButton = screen.getByLabelText(/toggle navigation/i);
      expect(toggleButton).toBeInTheDocument();
    });
  });
});
