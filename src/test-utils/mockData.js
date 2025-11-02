/**
 * Mock data for testing
 * Provides reusable mock data for users, documents, API responses, etc.
 */

// Mock Users
export const mockUsers = {
  regularUser: {
    id: '1',
    username: 'testuser',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    roles: ['ROLE_USER'],
    isActive: true,
    createdAt: '2024-01-15T10:00:00Z',
  },
  adminUser: {
    id: '2',
    username: 'adminuser',
    email: 'admin@example.com',
    firstName: 'Admin',
    lastName: 'User',
    roles: ['ROLE_ADMIN', 'ROLE_USER'],
    isActive: true,
    createdAt: '2024-01-10T10:00:00Z',
  },
  inactiveUser: {
    id: '3',
    username: 'inactive',
    email: 'inactive@example.com',
    firstName: 'Inactive',
    lastName: 'User',
    roles: ['ROLE_USER'],
    isActive: false,
    createdAt: '2024-01-01T10:00:00Z',
  },
};

// Mock Authentication Tokens
export const mockTokens = {
  accessToken: 'mock-access-token-12345',
  refreshToken: 'mock-refresh-token-67890',
  expiredAccessToken: 'mock-expired-access-token',
};

// Mock Documents
export const mockDocuments = {
  pdfDocument: {
    id: '101',
    filename: 'invoice-2024.pdf',
    originalFilename: 'invoice-2024.pdf',
    mimeType: 'application/pdf',
    size: 245680,
    category: 'invoice',
    status: 'completed',
    ocrText: 'Invoice #12345\nDate: 2024-01-15\nTotal: $1,234.56',
    extractedMetadata: {
      documentType: 'invoice',
      invoiceNumber: '12345',
      date: '2024-01-15',
      total: 1234.56,
    },
    tags: ['invoice', '2024', 'important'],
    uploadedBy: '1',
    createdAt: '2024-01-15T14:30:00Z',
    updatedAt: '2024-01-15T14:35:00Z',
  },
  processingDocument: {
    id: '102',
    filename: 'contract-draft.pdf',
    originalFilename: 'contract-draft.pdf',
    mimeType: 'application/pdf',
    size: 512000,
    category: 'contract',
    status: 'processing',
    ocrText: null,
    extractedMetadata: null,
    tags: ['contract', 'draft'],
    uploadedBy: '1',
    createdAt: '2024-01-16T09:00:00Z',
    updatedAt: '2024-01-16T09:00:00Z',
  },
  failedDocument: {
    id: '103',
    filename: 'corrupted-file.pdf',
    originalFilename: 'corrupted-file.pdf',
    mimeType: 'application/pdf',
    size: 1024,
    category: 'other',
    status: 'failed',
    ocrText: null,
    extractedMetadata: null,
    errorMessage: 'OCR processing failed: corrupted file',
    tags: [],
    uploadedBy: '2',
    createdAt: '2024-01-14T08:00:00Z',
    updatedAt: '2024-01-14T08:05:00Z',
  },
  imageDocument: {
    id: '104',
    filename: 'receipt-scan.jpg',
    originalFilename: 'receipt-scan.jpg',
    mimeType: 'image/jpeg',
    size: 89600,
    category: 'receipt',
    status: 'completed',
    ocrText: 'Store Name\nReceipt\nDate: 2024-01-10\nTotal: $45.99',
    extractedMetadata: {
      documentType: 'receipt',
      date: '2024-01-10',
      total: 45.99,
    },
    tags: ['receipt', 'expense'],
    uploadedBy: '1',
    createdAt: '2024-01-10T16:20:00Z',
    updatedAt: '2024-01-10T16:22:00Z',
  },
};

// Mock Document List Response
export const mockDocumentListResponse = {
  data: [
    mockDocuments.pdfDocument,
    mockDocuments.processingDocument,
    mockDocuments.imageDocument,
  ],
  pagination: {
    total: 3,
    limit: 20,
    offset: 0,
    hasMore: false,
  },
};

// Mock Search Results
export const mockSearchResults = {
  results: [mockDocuments.pdfDocument, mockDocuments.imageDocument],
  total: 2,
  query: 'invoice',
  facets: {
    category: {
      invoice: 1,
      receipt: 1,
    },
    status: {
      completed: 2,
    },
  },
};

// Mock Roles
export const mockRoles = {
  userRole: {
    id: '1',
    name: 'ROLE_USER',
    description: 'Standard user role',
    permissions: [
      'document.view',
      'document.upload',
      'document.edit.own',
      'document.delete.own',
      'search.use',
    ],
  },
  adminRole: {
    id: '2',
    name: 'ROLE_ADMIN',
    description: 'Administrator role',
    permissions: [
      'document.view',
      'document.upload',
      'document.edit.all',
      'document.delete.all',
      'search.use',
      'user.manage',
      'role.manage',
      'admin.dashboard',
      'audit.view',
    ],
  },
};

// Mock Audit Logs
export const mockAuditLogs = [
  {
    id: '1',
    userId: '1',
    username: 'testuser',
    action: 'document.upload',
    entityType: 'document',
    entityId: '101',
    details: 'Uploaded invoice-2024.pdf',
    ipAddress: '192.168.1.100',
    timestamp: '2024-01-15T14:30:00Z',
  },
  {
    id: '2',
    userId: '2',
    username: 'adminuser',
    action: 'user.create',
    entityType: 'user',
    entityId: '3',
    details: 'Created user inactive',
    ipAddress: '192.168.1.101',
    timestamp: '2024-01-01T10:00:00Z',
  },
];

// Mock Dashboard Metrics
export const mockDashboardMetrics = {
  totalDocuments: 1247,
  processedToday: 23,
  activeUsers: 45,
  storageUsed: 5368709120, // bytes (5GB)
  queueStatus: {
    pending: 3,
    processing: 1,
    failed: 2,
  },
  recentActivity: [
    {
      type: 'upload',
      count: 15,
      date: '2024-01-16',
    },
    {
      type: 'upload',
      count: 23,
      date: '2024-01-15',
    },
  ],
};

// Mock System Health
export const mockSystemHealth = {
  overall: 'healthy',
  services: {
    backend: { status: 'healthy', responseTime: 45 },
    database: { status: 'healthy', responseTime: 12 },
    redis: { status: 'healthy', responseTime: 5 },
    meilisearch: { status: 'healthy', responseTime: 23 },
    ocrService: { status: 'healthy', responseTime: 156 },
  },
  lastCheck: '2024-01-16T10:00:00Z',
};

// Mock API Error Responses
export const mockApiErrors = {
  unauthorized: {
    response: {
      status: 401,
      data: {
        message: 'Unauthorized',
        error: 'Invalid credentials',
      },
    },
  },
  forbidden: {
    response: {
      status: 403,
      data: {
        message: 'Forbidden',
        error: 'You do not have permission to perform this action',
      },
    },
  },
  notFound: {
    response: {
      status: 404,
      data: {
        message: 'Not Found',
        error: 'Resource not found',
      },
    },
  },
  validationError: {
    response: {
      status: 422,
      data: {
        message: 'Validation Error',
        errors: {
          username: ['Username is required'],
          password: ['Password must be at least 6 characters'],
        },
      },
    },
  },
  serverError: {
    response: {
      status: 500,
      data: {
        message: 'Internal Server Error',
        error: 'An unexpected error occurred',
      },
    },
  },
  networkError: {
    message: 'Network Error',
    code: 'ERR_NETWORK',
  },
};

// Mock Auth State
export const mockAuthState = {
  authenticated: {
    user: mockUsers.regularUser,
    accessToken: mockTokens.accessToken,
    refreshToken: mockTokens.refreshToken,
    isAuthenticated: true,
    loading: false,
    error: null,
  },
  unauthenticated: {
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  },
  loading: {
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    loading: true,
    error: null,
  },
  error: {
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    loading: false,
    error: 'Login failed',
  },
};

// Helper function to create mock store preloaded state
export const createMockStoreState = (overrides = {}) => ({
  auth: mockAuthState.authenticated,
  documents: {
    items: [mockDocuments.pdfDocument],
    loading: false,
    error: null,
    filters: {},
    pagination: {
      total: 1,
      limit: 20,
      offset: 0,
    },
  },
  ...overrides,
});

export default {
  mockUsers,
  mockTokens,
  mockDocuments,
  mockDocumentListResponse,
  mockSearchResults,
  mockRoles,
  mockAuditLogs,
  mockDashboardMetrics,
  mockSystemHealth,
  mockApiErrors,
  mockAuthState,
  createMockStoreState,
};
