import React from 'react';
import PropTypes from 'prop-types';
import Container from 'react-bootstrap/Container';
import Alert from 'react-bootstrap/Alert';
import Button from './Button';
import { ExclamationTriangleFill } from 'react-bootstrap-icons';

/**
 * ErrorBoundary - React error boundary component
 *
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI
 *
 * Must be a class component because error boundaries require
 * componentDidCatch lifecycle method
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError() {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console (can be replaced with error reporting service)
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Update state with error details
    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    // Reset the error boundary state
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });

    // Call custom reset handler if provided
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI provided
      if (this.props.fallback) {
        return this.props.fallback({
          error: this.state.error,
          errorInfo: this.state.errorInfo,
          resetError: this.handleReset,
        });
      }

      // Default fallback UI
      return (
        <Container className="py-5">
          <Alert variant="danger">
            <Alert.Heading>
              <ExclamationTriangleFill className="me-2" size={24} />
              Oops! Something went wrong
            </Alert.Heading>
            <p>
              We&apos;re sorry, but something unexpected happened. The error has been logged
              and we&apos;ll look into it.
            </p>

            {/* Show error details in development mode */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-3">
                <summary className="cursor-pointer text-decoration-underline">
                  View error details
                </summary>
                <div className="mt-2 p-3 bg-light rounded">
                  <h6>Error:</h6>
                  <pre className="text-danger small mb-3">
                    {this.state.error.toString()}
                  </pre>

                  {this.state.errorInfo && (
                    <>
                      <h6>Component Stack:</h6>
                      <pre className="small text-muted" style={{ maxHeight: '300px', overflow: 'auto' }}>
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </>
                  )}
                </div>
              </details>
            )}

            <hr />

            <div className="d-flex gap-2">
              <Button variant="primary" onClick={this.handleReset}>
                Try Again
              </Button>
              <Button
                variant="outline-secondary"
                onClick={() => window.location.reload()}
              >
                Reload Page
              </Button>
            </div>
          </Alert>
        </Container>
      );
    }

    // No error, render children normally
    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  fallback: PropTypes.func,
  onError: PropTypes.func,
  onReset: PropTypes.func,
};

export default ErrorBoundary;
