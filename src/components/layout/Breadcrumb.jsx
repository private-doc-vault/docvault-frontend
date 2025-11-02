import { Link, useLocation } from 'react-router-dom';
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import { HouseDoor } from 'react-bootstrap-icons';
import ROUTES from '../../routes/routes';

/**
 * Breadcrumb - Hierarchical navigation component
 *
 * Displays breadcrumb trail based on current route
 * Supports custom breadcrumb configurations for complex routes
 */
const AppBreadcrumb = ({ items = null }) => {
  const location = useLocation();

  // Route name mapping for automatic breadcrumb generation
  const routeNames = {
    [ROUTES.HOME]: 'Home',
    [ROUTES.DASHBOARD]: 'Dashboard',
    [ROUTES.DOCUMENTS]: 'Documents',
    [ROUTES.DOCUMENT_UPLOAD]: 'Upload',
    [ROUTES.SEARCH]: 'Search',
    [ROUTES.PROFILE]: 'Profile',
    [ROUTES.SETTINGS]: 'Settings',
    [ROUTES.ADMIN_DASHBOARD]: 'Admin Dashboard',
    [ROUTES.ADMIN_USERS]: 'Users',
    [ROUTES.ADMIN_ROLES]: 'Roles & Permissions',
    [ROUTES.ADMIN_AUDIT_LOGS]: 'Audit Logs',
    [ROUTES.ADMIN_SYSTEM]: 'System Status',
  };

  /**
   * Generate breadcrumb items from current path
   */
  const generateBreadcrumbs = () => {
    // If custom items provided, use them
    if (items && items.length > 0) {
      return items;
    }

    // Generate from current path
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = [{ label: 'Home', path: ROUTES.HOME, icon: <HouseDoor /> }];

    let currentPath = '';
    pathSegments.forEach((segment) => {
      currentPath += `/${segment}`;

      // Check if this is a dynamic segment (e.g., document ID)
      const isDynamicSegment = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment) ||
                               /^\d+$/.test(segment);

      if (isDynamicSegment) {
        // For dynamic segments, use a generic label
        breadcrumbs.push({
          label: 'Detail',
          path: currentPath,
        });
      } else {
        // Look up the route name
        const routeName = routeNames[currentPath] || segment.charAt(0).toUpperCase() + segment.slice(1);
        breadcrumbs.push({
          label: routeName,
          path: currentPath,
        });
      }
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  // Don't render breadcrumb on login page or if only home
  if (location.pathname === ROUTES.LOGIN || breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <Breadcrumb className="bg-light px-3 py-2 rounded mb-3">
      {breadcrumbs.map((item, index) => {
        const isLast = index === breadcrumbs.length - 1;

        return (
          <Breadcrumb.Item
            key={item.path}
            linkAs={isLast ? 'span' : Link}
            linkProps={isLast ? {} : { to: item.path }}
            active={isLast}
          >
            {item.icon && <span className="me-1">{item.icon}</span>}
            {item.label}
          </Breadcrumb.Item>
        );
      })}
    </Breadcrumb>
  );
};

export default AppBreadcrumb;
