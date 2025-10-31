/**
 * Route path constants
 * Centralized route definitions for the application
 */
const ROUTES = {
  // Public routes
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  UNAUTHORIZED: '/unauthorized',

  // Protected routes
  HOME: '/',
  DASHBOARD: '/dashboard',

  // Document routes
  DOCUMENTS: '/documents',
  DOCUMENT_DETAIL: '/documents/:id',
  DOCUMENT_UPLOAD: '/documents/upload',

  // Search routes
  SEARCH: '/search',

  // User routes
  PROFILE: '/profile',
  SETTINGS: '/settings',

  // Admin routes
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_USERS: '/admin/users',
  ADMIN_ROLES: '/admin/roles',
  ADMIN_AUDIT_LOGS: '/admin/audit-logs',
  ADMIN_SYSTEM: '/admin/system',
};

export default ROUTES;
