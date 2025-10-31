import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import rootReducer from '../store/rootReducer';

/**
 * Render component with Redux and Router providers for testing
 *
 * @param {React.ReactElement} ui - Component to render
 * @param {Object} options - Rendering options
 * @param {Object} options.preloadedState - Initial Redux state
 * @param {Object} options.store - Custom store instance (optional)
 * @param {Array} options.initialEntries - Initial router entries for MemoryRouter
 * @param {string} options.initialIndex - Initial index in router history
 * @param {boolean} options.useBrowserRouter - Use BrowserRouter instead of MemoryRouter
 * @param {Object} options.renderOptions - Additional options passed to render()
 * @returns {Object} - Render result with added store property
 */
export function renderWithProviders(
  ui,
  {
    preloadedState = {},
    store = configureStore({
      reducer: rootReducer,
      preloadedState,
    }),
    initialEntries = ['/'],
    initialIndex,
    useBrowserRouter = false,
    ...renderOptions
  } = {}
) {
  const Router = useBrowserRouter ? BrowserRouter : MemoryRouter;

  const routerProps = useBrowserRouter
    ? {}
    : {
        initialEntries,
        ...(initialIndex !== undefined && { initialIndex }),
      };

  function Wrapper({ children }) {
    return (
      <Provider store={store}>
        <Router {...routerProps}>{children}</Router>
      </Provider>
    );
  }

  return {
    store,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
}

/**
 * Create a mock store for testing
 *
 * @param {Object} preloadedState - Initial state
 * @returns {Object} - Configured Redux store
 */
export function createMockStore(preloadedState = {}) {
  return configureStore({
    reducer: rootReducer,
    preloadedState,
  });
}

export default renderWithProviders;
