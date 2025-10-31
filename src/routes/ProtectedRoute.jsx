import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../features/auth/authSlice';
import tokenManager from '../utils/tokenManager';

/**
 * ProtectedRoute component
 * Protects routes that require authentication
 * Redirects to login if user is not authenticated
 *
 * @param {object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if authenticated
 * @param {string[]} props.requiredRoles - Optional array of required roles
 */
const ProtectedRoute = ({ children, requiredRoles = [] }) => {
  const location = useLocation();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const hasTokens = tokenManager.hasTokens();

  // Check if user is authenticated (either in Redux state or has stored tokens)
  if (!isAuthenticated && !hasTokens) {
    // Redirect to login page, preserving the intended destination
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If requiredRoles is specified, check user roles
  if (requiredRoles.length > 0) {
    const user = tokenManager.getUser();
    const userRoles = user?.roles || [];

    // Check if user has at least one of the required roles
    const hasRequiredRole = requiredRoles.some((role) =>
      userRoles.includes(role)
    );

    if (!hasRequiredRole) {
      // User doesn't have required role, redirect to unauthorized page
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // User is authenticated and has required roles, render children
  return children;
};

export default ProtectedRoute;
