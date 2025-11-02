import { render, screen, fireEvent } from '@testing-library/react';
import ErrorBoundary from './ErrorBoundary';

/**
 * Component that throws an error for testing
 */
const ThrowError = ({ shouldThrow = false, errorMessage = 'Test error' }) => {
  if (shouldThrow) {
    throw new Error(errorMessage);
  }
  return <div>No error</div>;
};

/**
 * Suppress console.error during tests to avoid cluttering test output
 */
const suppressConsoleError = () => {
  const originalError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });
  afterAll(() => {
    console.error = originalError;
  });
};

describe('ErrorBoundary', () => {
  suppressConsoleError();

  describe('when there is no error', () => {
    it('should render children normally', () => {
      render(
        <ErrorBoundary>
          <div>Test content</div>
        </ErrorBoundary>
      );

      expect(screen.getByText('Test content')).toBeInTheDocument();
    });

    it('should not display error UI', () => {
      render(
        <ErrorBoundary>
          <div>Test content</div>
        </ErrorBoundary>
      );

      expect(
        screen.queryByText(/something went wrong/i)
      ).not.toBeInTheDocument();
    });
  });

  describe('when an error occurs', () => {
    it('should catch error and display fallback UI', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
      expect(screen.queryByText('No error')).not.toBeInTheDocument();
    });

    it('should display error heading', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(
        screen.getByText(/oops! something went wrong/i)
      ).toBeInTheDocument();
    });

    it('should display error message', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(
        screen.getByText(/we're sorry, but something unexpected happened/i)
      ).toBeInTheDocument();
    });

    it('should display Try Again button', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(
        screen.getByRole('button', { name: /try again/i })
      ).toBeInTheDocument();
    });

    it('should display Reload Page button', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(
        screen.getByRole('button', { name: /reload page/i })
      ).toBeInTheDocument();
    });
  });

  describe('error recovery', () => {
    it('should reset error state when Try Again is clicked', () => {
      let shouldThrow = true;
      const TestComponent = () => <ThrowError shouldThrow={shouldThrow} />;

      const { rerender } = render(
        <ErrorBoundary>
          <TestComponent />
        </ErrorBoundary>
      );

      // Error boundary shows fallback
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();

      // Click Try Again and change error state
      shouldThrow = false;
      const tryAgainButton = screen.getByRole('button', { name: /try again/i });
      fireEvent.click(tryAgainButton);

      // Re-render with the component that no longer throws
      rerender(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      // Should show normal content
      expect(screen.getByText('No error')).toBeInTheDocument();
      expect(
        screen.queryByText(/something went wrong/i)
      ).not.toBeInTheDocument();
    });
  });

  describe('custom handlers', () => {
    it('should call onError callback when error occurs', () => {
      const onError = jest.fn();

      render(
        <ErrorBoundary onError={onError}>
          <ThrowError shouldThrow={true} errorMessage="Custom error" />
        </ErrorBoundary>
      );

      expect(onError).toHaveBeenCalled();
      expect(onError.mock.calls[0][0].message).toBe('Custom error');
    });

    it('should call onReset callback when Try Again is clicked', () => {
      const onReset = jest.fn();

      render(
        <ErrorBoundary onReset={onReset}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const tryAgainButton = screen.getByRole('button', { name: /try again/i });
      fireEvent.click(tryAgainButton);

      expect(onReset).toHaveBeenCalledTimes(1);
    });
  });

  describe('custom fallback UI', () => {
    it('should render custom fallback when provided', () => {
      const customFallback = ({ error }) => (
        <div>
          <h1>Custom Error UI</h1>
          <p>{error?.message || 'Unknown error'}</p>
          <button>Custom Reset</button>
        </div>
      );

      render(
        <ErrorBoundary fallback={customFallback}>
          <ThrowError shouldThrow={true} errorMessage="Test error message" />
        </ErrorBoundary>
      );

      expect(
        screen.getByRole('heading', { name: 'Custom Error UI' })
      ).toBeInTheDocument();
      expect(screen.getByText('Test error message')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /custom reset/i })
      ).toBeInTheDocument();
    });

    it('should call resetError from custom fallback', () => {
      const onReset = jest.fn();
      const customFallback = ({ resetError }) => (
        <div>
          <button onClick={resetError}>Custom Reset</button>
        </div>
      );

      render(
        <ErrorBoundary fallback={customFallback} onReset={onReset}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const resetButton = screen.getByRole('button', { name: /custom reset/i });
      fireEvent.click(resetButton);

      // Verify that onReset callback was called
      expect(onReset).toHaveBeenCalledTimes(1);
    });
  });

  describe('development mode', () => {
    const originalEnv = process.env.NODE_ENV;

    afterEach(() => {
      process.env.NODE_ENV = originalEnv;
    });

    it('should show error details in development mode', () => {
      process.env.NODE_ENV = 'development';

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} errorMessage="Dev error" />
        </ErrorBoundary>
      );

      expect(screen.getByText(/view error details/i)).toBeInTheDocument();
    });
  });
});
