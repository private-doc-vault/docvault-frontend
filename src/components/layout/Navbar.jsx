import { Link, useNavigate } from 'react-router-dom';
import Navbar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { Search, PersonCircle } from 'react-bootstrap-icons';
import useAuth from '../../hooks/useAuth';
import ROUTES from '../../routes/routes';

/**
 * Navbar - Top navigation bar component
 *
 * Features:
 * - DocVault logo/brand
 * - Search shortcut button
 * - User profile dropdown with logout
 */
const AppNavbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.LOGIN);
  };

  const handleSearchClick = () => {
    navigate(ROUTES.SEARCH);
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="shadow-sm">
      <Container fluid>
        {/* Logo/Brand */}
        <Navbar.Brand as={Link} to={ROUTES.HOME} className="fw-bold">
          <span className="text-primary">Doc</span>Vault
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="navbar-nav" />

        <Navbar.Collapse id="navbar-nav">
          {/* Main navigation links */}
          {isAuthenticated && (
            <Nav className="me-auto">
              <Nav.Link as={Link} to={ROUTES.DOCUMENTS}>
                Documents
              </Nav.Link>
              <Nav.Link as={Link} to={ROUTES.SEARCH}>
                Search
              </Nav.Link>
            </Nav>
          )}

          {/* Right side: Search button and user menu */}
          {isAuthenticated && (
            <Nav className="ms-auto align-items-center">
              {/* Search shortcut button */}
              <Button
                variant="outline-light"
                size="sm"
                className="me-3"
                onClick={handleSearchClick}
                aria-label="Search documents"
              >
                <Search className="me-1" />
                Search
              </Button>

              {/* User menu dropdown */}
              <NavDropdown
                title={
                  <span>
                    <PersonCircle className="me-1" size={20} />
                    {user?.username || 'User'}
                  </span>
                }
                id="user-menu-dropdown"
                align="end"
              >
                <NavDropdown.Item as={Link} to={ROUTES.PROFILE}>
                  Profile
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to={ROUTES.SETTINGS}>
                  Settings
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout}>
                  Logout
                </NavDropdown.Item>
              </NavDropdown>
            </Nav>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;
