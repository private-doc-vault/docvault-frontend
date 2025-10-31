import { configureStore } from '@reduxjs/toolkit';
import rootReducer from '../../store/rootReducer';
import {
  setDocuments,
  addDocument,
  updateDocument,
  deleteDocument,
  setFilters,
  setPagination,
} from '../../features/documents/documentsSlice';

describe('Document Workflow Integration Tests', () => {
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: rootReducer,
    });
  });

  describe('Document Upload Workflow', () => {
    it('should handle complete upload workflow with Redux state updates', () => {
      const initialDocuments = [
        {
          id: 1,
          filename: 'existing.pdf',
          title: 'Existing Doc',
          ocrStatus: 'completed',
        },
      ];

      // Set initial documents
      store.dispatch(setDocuments(initialDocuments));
      store.dispatch(setPagination({ totalItems: 1 }));

      expect(store.getState().documents.documents).toHaveLength(1);

      // Simulate uploading a new document
      const newDocument = {
        id: 2,
        filename: 'new-upload.pdf',
        title: 'New Upload',
        ocrStatus: 'pending',
        createdAt: new Date().toISOString(),
        fileSize: 2048,
      };

      store.dispatch(addDocument(newDocument));

      // Verify document was added
      const state = store.getState().documents;
      expect(state.documents).toHaveLength(2);
      expect(state.documents[0]).toEqual(newDocument); // Added to front
      expect(state.pagination.totalItems).toBe(2);
    });

    it('should handle batch upload workflow', () => {
      store.dispatch(setDocuments([]));

      // Simulate uploading multiple documents
      const uploads = [
        { id: 1, filename: 'file1.pdf', ocrStatus: 'pending' },
        { id: 2, filename: 'file2.pdf', ocrStatus: 'pending' },
        { id: 3, filename: 'file3.pdf', ocrStatus: 'pending' },
      ];

      uploads.forEach((doc) => store.dispatch(addDocument(doc)));

      expect(store.getState().documents.documents).toHaveLength(3);
      expect(store.getState().documents.pagination.totalItems).toBe(3);
    });
  });

  describe('Document Edit Workflow', () => {
    it('should handle complete edit workflow with state updates', () => {
      const document = {
        id: 1,
        filename: 'doc.pdf',
        title: 'Original Title',
        description: 'Original description',
        category: 'Invoice',
        tags: ['old'],
      };

      store.dispatch(setDocuments([document]));

      // Simulate editing the document
      const updatedDocument = {
        ...document,
        title: 'Updated Title',
        description: 'Updated description',
        category: 'Contract',
        tags: ['new', 'updated'],
      };

      store.dispatch(updateDocument(updatedDocument));

      const state = store.getState().documents;
      expect(state.documents[0].title).toBe('Updated Title');
      expect(state.documents[0].description).toBe('Updated description');
      expect(state.documents[0].category).toBe('Contract');
      expect(state.documents[0].tags).toEqual(['new', 'updated']);
    });
  });

  describe('Document Delete Workflow', () => {
    it('should handle complete delete workflow with state updates', () => {
      const documents = [
        { id: 1, filename: 'doc1.pdf', title: 'Doc 1' },
        { id: 2, filename: 'doc2.pdf', title: 'Doc 2' },
        { id: 3, filename: 'doc3.pdf', title: 'Doc 3' },
      ];

      store.dispatch(setDocuments(documents));
      store.dispatch(setPagination({ totalItems: 3 }));

      // Delete middle document
      store.dispatch(deleteDocument(2));

      const state = store.getState().documents;
      expect(state.documents).toHaveLength(2);
      expect(state.documents.find((d) => d.id === 2)).toBeUndefined();
      expect(state.pagination.totalItems).toBe(2);
    });
  });

  describe('Search and Filter Workflow', () => {
    it('should handle complete search/filter workflow', () => {
      const documents = [
        {
          id: 1,
          filename: 'invoice.pdf',
          category: 'Invoice',
          ocrStatus: 'completed',
        },
        {
          id: 2,
          filename: 'receipt.pdf',
          category: 'Receipt',
          ocrStatus: 'pending',
        },
        {
          id: 3,
          filename: 'contract.pdf',
          category: 'Contract',
          ocrStatus: 'completed',
        },
      ];

      store.dispatch(setDocuments(documents));
      store.dispatch(setPagination({ currentPage: 3 })); // User was on page 3

      // Apply filters
      store.dispatch(
        setFilters({
          search: 'invoice',
          category: 'Invoice',
          status: 'completed',
        })
      );

      const state = store.getState().documents;
      expect(state.filters.search).toBe('invoice');
      expect(state.filters.category).toBe('Invoice');
      expect(state.filters.status).toBe('completed');
      expect(state.pagination.currentPage).toBe(1); // Reset to page 1
    });
  });

  describe('Pagination Workflow', () => {
    it('should handle pagination across multiple pages', () => {
      // Simulate first page load
      const firstPageDocs = Array.from({ length: 20 }, (_, i) => ({
        id: i + 1,
        filename: `doc${i + 1}.pdf`,
      }));

      store.dispatch(setDocuments(firstPageDocs));
      store.dispatch(
        setPagination({
          currentPage: 1,
          totalItems: 100,
          totalPages: 5,
        })
      );

      let state = store.getState().documents;
      expect(state.documents).toHaveLength(20);
      expect(state.pagination.currentPage).toBe(1);
      expect(state.pagination.totalPages).toBe(5);

      // Navigate to page 2
      store.dispatch(setPagination({ currentPage: 2 }));

      const secondPageDocs = Array.from({ length: 20 }, (_, i) => ({
        id: i + 21,
        filename: `doc${i + 21}.pdf`,
      }));

      store.dispatch(setDocuments(secondPageDocs));

      state = store.getState().documents;
      expect(state.pagination.currentPage).toBe(2);
      expect(state.documents[0].id).toBe(21);
    });
  });

  describe('Complex Workflow Scenarios', () => {
    it('should handle upload, edit, and delete in sequence', () => {
      // Start with empty state
      store.dispatch(setDocuments([]));

      // 1. Upload a document
      const uploadedDoc = {
        id: 1,
        filename: 'new.pdf',
        title: 'New Document',
        category: 'Invoice',
      };
      store.dispatch(addDocument(uploadedDoc));

      expect(store.getState().documents.documents).toHaveLength(1);

      // 2. Edit the document
      const editedDoc = {
        ...uploadedDoc,
        title: 'Edited Document',
        category: 'Contract',
      };
      store.dispatch(updateDocument(editedDoc));

      let state = store.getState().documents;
      expect(state.documents[0].title).toBe('Edited Document');
      expect(state.documents[0].category).toBe('Contract');

      // 3. Delete the document
      store.dispatch(deleteDocument(1));

      state = store.getState().documents;
      expect(state.documents).toHaveLength(0);
    });

    it('should maintain state consistency during concurrent operations', () => {
      // Simulate multiple operations happening
      store.dispatch(setDocuments([{ id: 1, filename: 'doc1.pdf' }]));
      store.dispatch(setPagination({ totalItems: 1 }));

      // Apply filters
      store.dispatch(setFilters({ category: 'Invoice' }));

      // Add document
      store.dispatch(addDocument({ id: 2, filename: 'doc2.pdf' }));

      // Update pagination (after addDocument already incremented to 2)
      store.dispatch(setPagination({ totalItems: 50, totalPages: 3 }));

      // Verify all state updates are applied correctly
      const state = store.getState().documents;
      expect(state.documents).toHaveLength(2);
      expect(state.filters.category).toBe('Invoice');
      expect(state.pagination.totalItems).toBe(50); // Explicitly set by setPagination
    });
  });
});
