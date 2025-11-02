import { http, HttpResponse } from 'msw';
import {
  mockUsers,
  mockTokens,
  mockDocuments,
  mockDocumentListResponse,
  mockSearchResults,
} from './mockData';

/**
 * MSW Request Handlers
 *
 * Define mock API endpoints for testing
 */

const API_URL = import.meta.env.VITE_API_URL || '/api';

export const handlers = [
  // Auth endpoints
  http.post(`${API_URL}/auth/login`, async ({ request }) => {
    const body = await request.json();

    if (
      body.email === 'testuser@example.com' &&
      body.password === 'password123'
    ) {
      return HttpResponse.json({
        user: mockUsers.regularUser,
        token: mockTokens.accessToken,
        refresh_token: mockTokens.refreshToken,
      });
    }

    if (body.email === 'admin@example.com' && body.password === 'admin123') {
      return HttpResponse.json({
        user: mockUsers.adminUser,
        token: mockTokens.accessToken,
        refresh_token: mockTokens.refreshToken,
      });
    }

    return HttpResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }),

  http.post(`${API_URL}/auth/logout`, () => {
    return HttpResponse.json({ message: 'Successfully logged out' });
  }),

  http.post(`${API_URL}/auth/refresh`, () => {
    return HttpResponse.json({
      token: 'new-access-token',
      refresh_token: 'new-refresh-token',
      expires_in: 3600,
    });
  }),

  http.get(`${API_URL}/auth/me`, ({ request }) => {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return HttpResponse.json({ user: mockUsers.regularUser });
  }),

  // Document endpoints
  http.get(`${API_URL}/documents`, ({ request }) => {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    return HttpResponse.json({
      ...mockDocumentListResponse,
      pagination: {
        ...mockDocumentListResponse.pagination,
        limit,
        offset,
      },
    });
  }),

  http.get(`${API_URL}/documents/:id`, ({ params }) => {
    const { id } = params;
    const document = Object.values(mockDocuments).find((doc) => doc.id === id);

    if (!document) {
      return HttpResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    return HttpResponse.json(document);
  }),

  http.post(`${API_URL}/documents`, async ({ request }) => {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return HttpResponse.json({ error: 'File is required' }, { status: 422 });
    }

    return HttpResponse.json(
      {
        ...mockDocuments.processingDocument,
        filename: file.name,
        originalFilename: file.name,
      },
      { status: 201 }
    );
  }),

  http.put(`${API_URL}/documents/:id`, async ({ params, request }) => {
    const { id } = params;
    const updates = await request.json();
    const document = Object.values(mockDocuments).find((doc) => doc.id === id);

    if (!document) {
      return HttpResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      ...document,
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  }),

  http.delete(`${API_URL}/documents/:id`, ({ params }) => {
    const { id } = params;
    const document = Object.values(mockDocuments).find((doc) => doc.id === id);

    if (!document) {
      return HttpResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    return HttpResponse.json({ message: 'Document deleted successfully' });
  }),

  // Search endpoints
  http.get(`${API_URL}/search`, ({ request }) => {
    const url = new URL(request.url);
    const query = url.searchParams.get('q');

    if (!query) {
      return HttpResponse.json(
        { error: 'Query parameter is required' },
        { status: 422 }
      );
    }

    return HttpResponse.json(mockSearchResults);
  }),
];
