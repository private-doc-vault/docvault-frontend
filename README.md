# DocVault Frontend

React-based web interface for the DocVault document management system.

## Tech Stack

- **React 19.1.1** - UI library
- **Vite 7.1.7** - Build tool and dev server
- **Redux Toolkit 2.9.2** - State management
- **React Router 7.9.4** - Client-side routing
- **React Bootstrap 2.10.10** - UI components
- **Axios 1.12.2** - HTTP client
- **React Hook Form 7.65.0** - Form handling
- **Yup 1.7.1** - Form validation

## Getting Started

### Prerequisites

- Node.js (v20.19.0 or >=22.12.0 recommended, v21.7.3 works but shows warnings)
- npm 10.x

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Runs the app in development mode at `http://localhost:5173`.
API requests are proxied to `http://localhost:8000` (configurable in `vite.config.js`).

### Build

```bash
npm run build
```

Builds the app for production to the `dist` folder.

### Preview Production Build

```bash
npm run preview
```

Preview the production build locally.

## Testing

### Test Infrastructure

The project uses:
- **Jest 30.2.0** - Test runner
- **React Testing Library 16.3.0** - Component testing utilities
- **MSW (Mock Service Worker) 2.11.6** - API mocking
- **@testing-library/user-event 14.6.1** - User interaction simulation

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (re-runs on file changes)
npm test:watch

# Run tests with coverage report
npm test:coverage
```

### Coverage Thresholds

The project enforces minimum code coverage of **70%** for:
- Branches
- Functions
- Lines
- Statements

Coverage reports are generated in the `coverage/` directory.

### Testing Best Practices

#### 1. Test File Location

Place test files alongside the code they test:

```
src/
  components/
    Button.jsx
    Button.test.jsx
  pages/
    LoginPage.jsx
    LoginPage.test.jsx
```

#### 2. Use Test Utilities

Always use the provided test utilities from `src/test-utils/`:

```javascript
import { renderWithProviders } from '../test-utils/renderWithProviders';
import { mockUsers, mockTokens } from '../test-utils/mockData';
import { server } from '../test-utils/server';
import { http, HttpResponse } from 'msw';
```

#### 3. Rendering Components with Providers

Use `renderWithProviders` to wrap components with Redux and Router:

```javascript
import { renderWithProviders } from '../test-utils/renderWithProviders';

test('renders component', () => {
  const { getByText } = renderWithProviders(
    <MyComponent />,
    {
      preloadedState: {
        auth: {
          user: mockUsers.regularUser,
          isAuthenticated: true,
        },
      },
      initialEntries: ['/dashboard'],
    }
  );

  expect(getByText('Dashboard')).toBeInTheDocument();
});
```

#### 4. Mocking API Calls

Use MSW to mock API responses:

```javascript
import { server } from '../test-utils/server';
import { http, HttpResponse } from 'msw';

test('handles API error', async () => {
  // Override default handler for this test
  server.use(
    http.get('/api/documents', () => {
      return HttpResponse.json(
        { message: 'Server error' },
        { status: 500 }
      );
    })
  );

  // Test error handling...
});
```

#### 5. User Interactions

Use `@testing-library/user-event` for realistic user interactions:

```javascript
import userEvent from '@testing-library/user-event';

test('submits form', async () => {
  const user = userEvent.setup();
  const { getByLabelText, getByRole } = renderWithProviders(<LoginPage />);

  await user.type(getByLabelText(/username/i), 'testuser');
  await user.type(getByLabelText(/password/i), 'password123');
  await user.click(getByRole('button', { name: /sign in/i }));

  // Assertions...
});
```

#### 6. Async Operations

Use `waitFor` for async state updates:

```javascript
import { waitFor } from '@testing-library/react';

test('loads data', async () => {
  renderWithProviders(<DocumentList />);

  await waitFor(() => {
    expect(screen.getByText('invoice.pdf')).toBeInTheDocument();
  });
});
```

#### 7. Query Priorities

Follow Testing Library's query priority:

1. **getByRole** - Most accessible (preferred)
2. **getByLabelText** - Good for forms
3. **getByPlaceholderText** - For inputs
4. **getByText** - For non-interactive elements
5. **getByTestId** - Last resort

```javascript
// ✅ Good - uses accessible queries
getByRole('button', { name: /submit/i })
getByLabelText(/email address/i)

// ❌ Avoid - uses test IDs
getByTestId('submit-button')
```

#### 8. Testing Accessibility

Test for proper ARIA labels and semantic HTML:

```javascript
test('has accessible form', () => {
  const { getByLabelText } = renderWithProviders(<LoginForm />);

  expect(getByLabelText(/username/i)).toBeInTheDocument();
  expect(getByLabelText(/password/i)).toHaveAttribute('type', 'password');
});
```

#### 9. Avoid Testing Implementation Details

Focus on user behavior, not internal state:

```javascript
// ✅ Good - tests user-facing behavior
expect(screen.getByText('Logged in as testuser')).toBeInTheDocument();

// ❌ Bad - tests implementation
expect(store.getState().auth.user.username).toBe('testuser');
```

#### 10. Mock Data

Use centralized mock data from `test-utils/mockData.js`:

```javascript
import {
  mockUsers,
  mockDocuments,
  mockTokens,
  createMockStoreState,
} from '../test-utils/mockData';

const { store } = renderWithProviders(<App />, {
  preloadedState: createMockStoreState({
    auth: { user: mockUsers.adminUser },
  }),
});
```

### Test Organization

Organize tests into logical groups using `describe` blocks:

```javascript
describe('LoginPage', () => {
  describe('Rendering', () => {
    test('renders login form', () => { /* ... */ });
    test('renders links', () => { /* ... */ });
  });

  describe('Form Validation', () => {
    test('validates required fields', () => { /* ... */ });
    test('validates field lengths', () => { /* ... */ });
  });

  describe('Authentication Flow', () => {
    test('logs in successfully', () => { /* ... */ });
    test('handles login errors', () => { /* ... */ });
  });
});
```

### Common Testing Patterns

#### Testing Redux Actions

```javascript
test('updates state on login', () => {
  const { store } = renderWithProviders(<LoginPage />);

  // Perform login...

  const state = store.getState();
  expect(state.auth.isAuthenticated).toBe(true);
  expect(state.auth.user).toEqual(mockUsers.regularUser);
});
```

#### Testing Navigation

```javascript
test('redirects after login', async () => {
  const { getByRole } = renderWithProviders(<LoginPage />, {
    initialEntries: ['/login'],
  });

  // Perform login...

  await waitFor(() => {
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });
});
```

#### Testing Loading States

```javascript
test('shows loading spinner', async () => {
  renderWithProviders(<DocumentList />);

  expect(screen.getByText(/loading/i)).toBeInTheDocument();

  await waitFor(() => {
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
  });
});
```

#### Testing Error States

```javascript
test('displays error message', async () => {
  server.use(
    http.get('/api/documents', () => {
      return HttpResponse.json(
        { message: 'Failed to load documents' },
        { status: 500 }
      );
    })
  );

  renderWithProviders(<DocumentList />);

  await waitFor(() => {
    expect(screen.getByText(/failed to load documents/i)).toBeInTheDocument();
  });
});
```

## Code Quality

### Linting

```bash
npm run lint
```

ESLint is configured with React, accessibility (jsx-a11y), and hooks rules.

### Formatting

```bash
# Format all files
npm run format

# Check formatting without modifying files
npm run format:check
```

Prettier is configured for consistent code style.

## Project Structure

```
frontend/
├── src/
│   ├── api/              # API client and endpoints
│   │   ├── apiClient.js  # Axios instance with interceptors
│   │   ├── authApi.js    # Auth API calls
│   │   └── ...
│   ├── components/       # Reusable components
│   │   ├── layout/       # Layout components (Navbar, Footer)
│   │   └── common/       # Common UI components
│   ├── features/         # Redux slices
│   │   ├── auth/         # Auth slice and logic
│   │   └── ...
│   ├── hooks/            # Custom React hooks
│   │   └── useAuth.js
│   ├── pages/            # Page components
│   │   ├── LoginPage.jsx
│   │   └── ...
│   ├── routes/           # Routing configuration
│   │   ├── index.jsx     # Route definitions
│   │   └── ProtectedRoute.jsx
│   ├── store/            # Redux store
│   │   ├── index.js      # Store configuration
│   │   └── rootReducer.js
│   ├── test-utils/       # Test utilities
│   │   ├── renderWithProviders.js
│   │   ├── mockData.js
│   │   ├── server.js     # MSW server
│   │   └── handlers.js   # API mock handlers
│   ├── utils/            # Utility functions
│   │   └── tokenManager.js
│   ├── __mocks__/        # Jest mocks
│   ├── App.jsx           # Root component
│   ├── main.jsx          # Entry point
│   └── setupTests.js     # Test setup
├── .babelrc              # Babel configuration for Jest
├── .env.development      # Development environment variables
├── .env.production       # Production environment variables
├── .eslintrc.js          # ESLint configuration
├── .prettierrc           # Prettier configuration
├── jest.config.js        # Jest configuration
├── package.json
├── vite.config.js        # Vite configuration
└── README.md
```

## Environment Variables

### Development (`.env.development`)

```
VITE_API_URL=http://localhost:8000
```

### Production (`.env.production`)

```
VITE_API_URL=/api
```

Access in code: `import.meta.env.VITE_API_URL`

## Authentication

The app uses JWT-based authentication with access and refresh tokens:

1. Login stores tokens in localStorage
2. Access token is sent with every API request via Authorization header
3. Expired tokens trigger automatic refresh
4. Failed refresh redirects to login page

Token management is handled by `src/utils/tokenManager.js` and `src/api/apiClient.js`.

## Docker Deployment

### Building the Docker Image

The frontend uses a multi-stage Docker build:
1. **Build stage**: Installs dependencies and builds the production bundle with Vite
2. **Production stage**: Serves static files with Nginx

Build the image:

```bash
docker build -t docvault-frontend ./frontend
```

Or use docker-compose:

```bash
docker-compose build frontend
```

### Running with Docker Compose

Start all services including the frontend:

```bash
docker-compose up -d
```

The frontend will be available at `http://localhost:3000`.

### Nginx Configuration

The production Nginx configuration includes:

- **API Proxy**: All `/api/*` requests are proxied to the backend service at `http://backend:8000`
- **SPA Routing**: Fallback to `index.html` for client-side routing (React Router)
- **Gzip Compression**: Enabled for text and JavaScript assets
- **Security Headers**: X-Frame-Options, X-Content-Type-Options, X-XSS-Protection
- **Cache Strategy**:
  - Static assets with hashes: 1 year cache
  - `index.html`: No cache (always fetch latest)

### Environment Variables

The Docker container accepts these environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `/api` |
| `VITE_APP_VERSION` | Application version | `1.0.0` |

Set in `docker-compose.yml`:

```yaml
environment:
  - VITE_API_URL=/api
  - VITE_APP_VERSION=1.0.0
```

### Testing the Docker Build

Test the build locally:

```bash
# Build
docker-compose build frontend

# Run
docker-compose up frontend

# Verify health
curl http://localhost:3000
```

### Verifying API Proxying

Test that API requests are properly proxied to the backend:

```bash
# Login endpoint should proxy to backend
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}'
```

### Verifying Client-Side Routing

Ensure page refreshes work correctly (no 404 errors):

1. Navigate to `http://localhost:3000/documents`
2. Refresh the page
3. Should still show the documents page, not a 404 error

This works because Nginx is configured with `try_files $uri $uri/ /index.html` to serve `index.html` for all non-asset routes.

## Troubleshooting

### Common Issues

#### Build Fails with Memory Error

If `npm run build` fails with a JavaScript heap out of memory error:

```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

#### API Requests Return 404

Check that:
1. Backend service is running: `docker-compose ps backend`
2. API URL is configured correctly in environment
3. Nginx proxy configuration is correct in `frontend/nginx.conf`

#### Static Assets Not Loading

Check browser console for 404 errors. Verify:
1. Build output exists: `ls frontend/dist`
2. Nginx is serving from correct directory: `/usr/share/nginx/html`
3. Docker volume mounts are correct

#### CORS Errors

If you see CORS errors in the browser console:
- API requests should go through Nginx proxy, not directly to backend
- Check `VITE_API_URL` is set to `/api`, not `http://localhost:8000`

#### Docker Container Exits Immediately

Check container logs:

```bash
docker-compose logs frontend
```

Common causes:
- Nginx configuration syntax error
- Missing files in `/usr/share/nginx/html`

#### Environment Variables Not Working

Remember:
- Vite environment variables must be prefixed with `VITE_`
- Environment variables are baked into the build at build time
- Rebuild the image after changing variables in docker-compose.yml

### Debugging

#### View Container Logs

```bash
# Follow logs
docker-compose logs -f frontend

# Last 100 lines
docker-compose logs --tail=100 frontend
```

#### Access Container Shell

```bash
docker-compose exec frontend sh

# Check Nginx config
nginx -t

# Check files
ls -la /usr/share/nginx/html
```

#### Test Nginx Configuration

```bash
# Check syntax
docker-compose exec frontend nginx -t

# Reload configuration
docker-compose exec frontend nginx -s reload
```

## Contributing

1. Write tests for all new features
2. Maintain >70% code coverage
3. Run linter and formatter before committing
4. Follow the testing best practices outlined above
5. Use semantic commit messages (feat:, fix:, docs:, etc.)

## License

[Add license information]
