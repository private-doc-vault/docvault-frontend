import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store';
import AppRoutes from './routes';
import MainLayout from './components/layout/MainLayout';
import ToastProvider from './components/common/ToastProvider';
import ErrorBoundary from './components/common/ErrorBoundary';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

/**
 * App - Root application component
 *
 * Sets up Redux store, React Router, ErrorBoundary, and global providers
 */
function App() {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <Router>
          <MainLayout>
            <AppRoutes />
          </MainLayout>
          <ToastProvider />
        </Router>
      </Provider>
    </ErrorBoundary>
  );
}

export default App;
