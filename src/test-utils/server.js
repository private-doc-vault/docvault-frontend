import { setupServer } from 'msw/node';
import { handlers } from './handlers';

/**
 * Mock Service Worker (MSW) server for API mocking in tests
 *
 * This sets up a mock server that intercepts HTTP requests during tests
 * and returns mocked responses based on the handlers defined.
 */
export const server = setupServer(...handlers);

// Enable API mocking before tests
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));

// Reset any request handlers that are declared as a part of individual tests
afterEach(() => server.resetHandlers());

// Clean up after all tests are done
afterAll(() => server.close());
