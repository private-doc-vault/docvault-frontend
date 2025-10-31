import Container from 'react-bootstrap/Container';
import PropTypes from 'prop-types';
import AppNavbar from './Navbar';
import AppBreadcrumb from './Breadcrumb';
import Footer from './Footer';

/**
 * MainLayout - Main application layout wrapper
 *
 * Provides consistent layout structure with navbar, breadcrumb, content area, and footer
 * Renders children components passed to it
 */
const MainLayout = ({ children }) => {
  return (
    <div className="d-flex flex-column min-vh-100">
      <AppNavbar />

      <main className="flex-grow-1 py-4">
        <Container fluid>
          <AppBreadcrumb />
          {children}
        </Container>
      </main>

      <Footer />
    </div>
  );
};

MainLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default MainLayout;
