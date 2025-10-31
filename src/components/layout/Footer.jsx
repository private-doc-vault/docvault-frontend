import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

/**
 * Footer - Application footer component
 *
 * Displays copyright information and version number
 */
const Footer = () => {
  const currentYear = new Date().getFullYear();
  const version = import.meta.env.VITE_APP_VERSION || '1.0.0';

  return (
    <footer className="bg-light border-top py-3 mt-auto">
      <Container fluid>
        <Row>
          <Col md={6} className="text-center text-md-start mb-2 mb-md-0">
            <small className="text-muted">
              &copy; {currentYear} DocVault. All rights reserved.
            </small>
          </Col>
          <Col md={6} className="text-center text-md-end">
            <small className="text-muted">
              Version {version}
            </small>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
