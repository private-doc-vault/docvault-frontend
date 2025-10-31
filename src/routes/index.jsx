import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import LoginPage from '../pages/LoginPage';
import DocumentListPage from '../pages/DocumentListPage';
import DocumentDetailPage from '../pages/DocumentDetailPage';
import SearchPage from '../pages/SearchPage';
import ROUTES from './routes';
import AuditLogPage from '../pages/admin/AuditLogPage';

// Placeholder components for routes not yet implemented
const DashboardPage = () => <div>Dashboard Page - Coming Soon</div>;
const ProfilePage = () => <div>Profile Page - Coming Soon</div>;
const RegisterPage = () => <div>Register Page - Coming Soon</div>;
const ForgotPasswordPage = () => <div>Forgot Password Page - Coming Soon</div>;
const UnauthorizedPage = () => (
  <div>
    <h1>403 - Unauthorized</h1>
    <p>You don&apos;t have permission to access this page.</p>
  </div>
);
const NotFoundPage = () => (
  <div>
    <h1>404 - Page Not Found</h1>
    <p>The page you are looking for does not exist.</p>
  </div>
);

// Admin placeholder components
const AdminDashboardPage = () => <div>Admin Dashboard - Coming Soon</div>;
const AdminUsersPage = () => <div>Admin Users - Coming Soon</div>;
const AdminRolesPage = () => <div>Admin Roles - Coming Soon</div>;

/**
 * AppRoutes component
 * Defines all application routes with React Router v6
 */
const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
      <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
      <Route path={ROUTES.UNAUTHORIZED} element={<UnauthorizedPage />} />

      {/* Protected Routes - Redirect root to dashboard */}
      <Route
        path={ROUTES.HOME}
        element={
          <ProtectedRoute>
            <Navigate to={ROUTES.DASHBOARD} replace />
          </ProtectedRoute>
        }
      />

      {/* Dashboard */}
      <Route
        path={ROUTES.DASHBOARD}
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      {/* Document Routes */}
      <Route
        path={ROUTES.DOCUMENTS}
        element={
          <ProtectedRoute>
            <DocumentListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.DOCUMENT_DETAIL}
        element={
          <ProtectedRoute>
            <DocumentDetailPage />
          </ProtectedRoute>
        }
      />

      {/* Search */}
      <Route
        path={ROUTES.SEARCH}
        element={
          <ProtectedRoute>
            <SearchPage />
          </ProtectedRoute>
        }
      />

      {/* User Routes */}
      <Route
        path={ROUTES.PROFILE}
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      {/* Admin Routes - Require ROLE_ADMIN */}
      <Route
        path={ROUTES.ADMIN_DASHBOARD}
        element={
          <ProtectedRoute requiredRoles={['ROLE_ADMIN']}>
            <AdminDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.ADMIN_USERS}
        element={
          <ProtectedRoute requiredRoles={['ROLE_ADMIN']}>
            <AdminUsersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.ADMIN_ROLES}
        element={
          <ProtectedRoute requiredRoles={['ROLE_ADMIN']}>
            <AdminRolesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.ADMIN_AUDIT_LOGS}
        element={
          <ProtectedRoute requiredRoles={['ROLE_ADMIN']}>
            <AuditLogPage />
          </ProtectedRoute>
        }
      />

      {/* 404 - Not Found */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
