import { NavLink } from 'react-router-dom';
import Nav from 'react-bootstrap/Nav';
import Offcanvas from 'react-bootstrap/Offcanvas';
import {
  HouseDoor,
  People,
  ShieldCheck,
  ClipboardData,
  GearWideConnected,
} from 'react-bootstrap-icons';
import ROUTES from '../../routes/routes';
import './Sidebar.css';

/**
 * Sidebar - Admin navigation sidebar
 *
 * Features:
 * - Admin navigation links (dashboard, users, roles, audit logs, system)
 * - Active route highlighting
 * - Collapsible on mobile devices (using Offcanvas)
 * - Icon-based navigation
 */
const Sidebar = ({ show, onHide, isMobile = false }) => {
  const navItems = [
    {
      path: ROUTES.ADMIN_DASHBOARD,
      icon: HouseDoor,
      label: 'Dashboard',
    },
    {
      path: ROUTES.ADMIN_USERS,
      icon: People,
      label: 'Users',
    },
    {
      path: ROUTES.ADMIN_ROLES,
      icon: ShieldCheck,
      label: 'Roles & Permissions',
    },
    {
      path: ROUTES.ADMIN_AUDIT_LOGS,
      icon: ClipboardData,
      label: 'Audit Logs',
    },
    {
      path: ROUTES.ADMIN_SYSTEM,
      icon: GearWideConnected,
      label: 'System Status',
    },
  ];

  const renderNavItems = () => (
    <Nav className="flex-column">
      {navItems.map(({ path, icon: Icon, label }) => (
        <Nav.Link
          key={path}
          as={NavLink}
          to={path}
          className="sidebar-nav-link d-flex align-items-center py-3 px-3"
          onClick={isMobile ? onHide : undefined}
        >
          <Icon className="me-3" size={20} />
          <span>{label}</span>
        </Nav.Link>
      ))}
    </Nav>
  );

  // Mobile view: Offcanvas sidebar
  if (isMobile) {
    return (
      <Offcanvas show={show} onHide={onHide} placement="start">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>
            <strong>Admin Menu</strong>
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="p-0">{renderNavItems()}</Offcanvas.Body>
      </Offcanvas>
    );
  }

  // Desktop view: Fixed sidebar
  return (
    <div className="sidebar bg-light border-end" style={{ width: '250px', minHeight: '100vh' }}>
      <div className="sidebar-header p-3 border-bottom">
        <h5 className="mb-0">Admin Panel</h5>
      </div>
      <div className="sidebar-body">{renderNavItems()}</div>
    </div>
  );
};

export default Sidebar;
