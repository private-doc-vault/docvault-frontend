import { configureStore } from '@reduxjs/toolkit';
import ocrReducer, {
  setOcrStatus,
  updateProgress,
  setOcrText,
  setOcrError,
  startPolling,
  stopPolling,
  clearPolling,
  clearOcrData,
  setLoading,
  setError,
  clearError,
  resetOcrState,
  selectOcrData,
  selectOcrDataForDocument,
  selectOcrStatus,
  selectOcrProgress,
  selectOcrText,
  selectOcrError,
  selectPollingDocuments,
  selectIsPolling,
  selectOcrLoading,
  selectOcrGlobalError,
} from './ocrSlice';

describe('ocrSlice', () => {
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        ocr: ocrReducer,
      },
    });
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = store.getState().ocr;

      expect(state.ocrData).toEqual({});
      expect(state.pollingDocuments).toEqual([]);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('setOcrStatus', () => {
    it('should set OCR status for a document', () => {
      store.dispatch(
        setOcrStatus({
          documentId: 1,
          status: 'processing',
          progress: 50,
        })
      );

      const state = store.getState().ocr;
      expect(state.ocrData[1]).toBeDefined();
      expect(state.ocrData[1].status).toBe('processing');
      expect(state.ocrData[1].progress).toBe(50);
      expect(state.ocrData[1].lastUpdated).toBeDefined();
    });

    it('should update existing OCR status', () => {
      // Initial status
      store.dispatch(
        setOcrStatus({
          documentId: 1,
          status: 'pending',
          progress: 0,
        })
      );

      // Update status
      store.dispatch(
        setOcrStatus({
          documentId: 1,
          status: 'completed',
          progress: 100,
          text: 'Extracted text',
        })
      );

      const state = store.getState().ocr;
      expect(state.ocrData[1].status).toBe('completed');
      expect(state.ocrData[1].progress).toBe(100);
      expect(state.ocrData[1].text).toBe('Extracted text');
    });

    it('should set error for failed status', () => {
      store.dispatch(
        setOcrStatus({
          documentId: 1,
          status: 'failed',
          error: 'OCR processing failed',
        })
      );

      const state = store.getState().ocr;
      expect(state.ocrData[1].status).toBe('failed');
      expect(state.ocrData[1].error).toBe('OCR processing failed');
    });
  });

  describe('updateProgress', () => {
    it('should update progress for a document', () => {
      store.dispatch(updateProgress({ documentId: 1, progress: 75 }));

      const state = store.getState().ocr;
      expect(state.ocrData[1].progress).toBe(75);
      expect(state.ocrData[1].lastUpdated).toBeDefined();
    });

    it('should create entry if document does not exist', () => {
      store.dispatch(updateProgress({ documentId: 2, progress: 25 }));

      const state = store.getState().ocr;
      expect(state.ocrData[2]).toBeDefined();
      expect(state.ocrData[2].progress).toBe(25);
    });
  });

  describe('setOcrText', () => {
    it('should set OCR text for a document', () => {
      store.dispatch(
        setOcrText({ documentId: 1, text: 'Sample OCR text' })
      );

      const state = store.getState().ocr;
      expect(state.ocrData[1].text).toBe('Sample OCR text');
      expect(state.ocrData[1].lastUpdated).toBeDefined();
    });
  });

  describe('setOcrError', () => {
    it('should set error and mark status as failed', () => {
      store.dispatch(
        setOcrError({ documentId: 1, error: 'Processing error' })
      );

      const state = store.getState().ocr;
      expect(state.ocrData[1].error).toBe('Processing error');
      expect(state.ocrData[1].status).toBe('failed');
      expect(state.ocrData[1].lastUpdated).toBeDefined();
    });
  });

  describe('polling management', () => {
    it('should add document to polling list', () => {
      store.dispatch(startPolling({ documentId: 1 }));

      const state = store.getState().ocr;
      expect(state.pollingDocuments).toContain(1);
    });

    it('should not add duplicate documents to polling list', () => {
      store.dispatch(startPolling({ documentId: 1 }));
      store.dispatch(startPolling({ documentId: 1 }));

      const state = store.getState().ocr;
      expect(state.pollingDocuments.length).toBe(1);
    });

    it('should remove document from polling list', () => {
      store.dispatch(startPolling({ documentId: 1 }));
      store.dispatch(startPolling({ documentId: 2 }));
      store.dispatch(stopPolling({ documentId: 1 }));

      const state = store.getState().ocr;
      expect(state.pollingDocuments).not.toContain(1);
      expect(state.pollingDocuments).toContain(2);
    });

    it('should clear all polling documents', () => {
      store.dispatch(startPolling({ documentId: 1 }));
      store.dispatch(startPolling({ documentId: 2 }));
      store.dispatch(clearPolling());

      const state = store.getState().ocr;
      expect(state.pollingDocuments).toEqual([]);
    });
  });

  describe('data management', () => {
    it('should clear OCR data for a document', () => {
      store.dispatch(
        setOcrStatus({ documentId: 1, status: 'completed', progress: 100 })
      );
      store.dispatch(clearOcrData({ documentId: 1 }));

      const state = store.getState().ocr;
      expect(state.ocrData[1]).toBeUndefined();
    });

    it('should not affect other documents when clearing', () => {
      store.dispatch(
        setOcrStatus({ documentId: 1, status: 'completed', progress: 100 })
      );
      store.dispatch(
        setOcrStatus({ documentId: 2, status: 'processing', progress: 50 })
      );
      store.dispatch(clearOcrData({ documentId: 1 }));

      const state = store.getState().ocr;
      expect(state.ocrData[1]).toBeUndefined();
      expect(state.ocrData[2]).toBeDefined();
    });
  });

  describe('global state management', () => {
    it('should set loading state', () => {
      store.dispatch(setLoading(true));
      expect(store.getState().ocr.loading).toBe(true);

      store.dispatch(setLoading(false));
      expect(store.getState().ocr.loading).toBe(false);
    });

    it('should set global error', () => {
      store.dispatch(setError('Global error'));
      expect(store.getState().ocr.error).toBe('Global error');
    });

    it('should clear global error', () => {
      store.dispatch(setError('Global error'));
      store.dispatch(clearError());
      expect(store.getState().ocr.error).toBeNull();
    });
  });

  describe('resetOcrState', () => {
    it('should reset to initial state', () => {
      // Populate state
      store.dispatch(setOcrStatus({ documentId: 1, status: 'completed' }));
      store.dispatch(startPolling({ documentId: 1 }));
      store.dispatch(setLoading(true));
      store.dispatch(setError('Error'));

      // Reset
      store.dispatch(resetOcrState());

      const state = store.getState().ocr;
      expect(state.ocrData).toEqual({});
      expect(state.pollingDocuments).toEqual([]);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('selectors', () => {
    beforeEach(() => {
      // Setup test data
      store.dispatch(
        setOcrStatus({
          documentId: 1,
          status: 'completed',
          progress: 100,
          text: 'Sample text',
        })
      );
      store.dispatch(
        setOcrStatus({
          documentId: 2,
          status: 'failed',
          error: 'Processing failed',
        })
      );
      store.dispatch(startPolling({ documentId: 3 }));
      store.dispatch(setLoading(true));
      store.dispatch(setError('Global error'));
    });

    it('should select all OCR data', () => {
      const data = selectOcrData(store.getState());
      expect(Object.keys(data)).toHaveLength(2);
      expect(data[1]).toBeDefined();
      expect(data[2]).toBeDefined();
    });

    it('should select OCR data for specific document', () => {
      const data = selectOcrDataForDocument(1)(store.getState());
      expect(data.status).toBe('completed');
      expect(data.progress).toBe(100);
      expect(data.text).toBe('Sample text');
    });

    it('should return null for non-existent document', () => {
      const data = selectOcrDataForDocument(999)(store.getState());
      expect(data).toBeNull();
    });

    it('should select OCR status', () => {
      const status = selectOcrStatus(1)(store.getState());
      expect(status).toBe('completed');
    });

    it('should select OCR progress', () => {
      const progress = selectOcrProgress(1)(store.getState());
      expect(progress).toBe(100);
    });

    it('should return 0 progress for non-existent document', () => {
      const progress = selectOcrProgress(999)(store.getState());
      expect(progress).toBe(0);
    });

    it('should select OCR text', () => {
      const text = selectOcrText(1)(store.getState());
      expect(text).toBe('Sample text');
    });

    it('should select OCR error', () => {
      const error = selectOcrError(2)(store.getState());
      expect(error).toBe('Processing failed');
    });

    it('should select polling documents', () => {
      const polling = selectPollingDocuments(store.getState());
      expect(polling).toContain(3);
    });

    it('should select isPolling for document', () => {
      const isPolling = selectIsPolling(3)(store.getState());
      expect(isPolling).toBe(true);

      const notPolling = selectIsPolling(1)(store.getState());
      expect(notPolling).toBe(false);
    });

    it('should select global loading state', () => {
      const loading = selectOcrLoading(store.getState());
      expect(loading).toBe(true);
    });

    it('should select global error', () => {
      const error = selectOcrGlobalError(store.getState());
      expect(error).toBe('Global error');
    });
  });

  describe('complex workflows', () => {
    it('should handle complete OCR processing workflow', () => {
      // 1. Start with pending status
      store.dispatch(
        setOcrStatus({ documentId: 1, status: 'pending', progress: 0 })
      );
      store.dispatch(startPolling({ documentId: 1 }));

      let state = store.getState().ocr;
      expect(state.ocrData[1].status).toBe('pending');
      expect(state.pollingDocuments).toContain(1);

      // 2. Update to processing
      store.dispatch(
        setOcrStatus({ documentId: 1, status: 'processing', progress: 25 })
      );

      state = store.getState().ocr;
      expect(state.ocrData[1].status).toBe('processing');
      expect(state.ocrData[1].progress).toBe(25);

      // 3. Update progress
      store.dispatch(updateProgress({ documentId: 1, progress: 50 }));
      store.dispatch(updateProgress({ documentId: 1, progress: 75 }));

      // 4. Complete processing
      store.dispatch(
        setOcrStatus({
          documentId: 1,
          status: 'completed',
          progress: 100,
          text: 'Extracted text content',
        })
      );
      store.dispatch(stopPolling({ documentId: 1 }));

      state = store.getState().ocr;
      expect(state.ocrData[1].status).toBe('completed');
      expect(state.ocrData[1].progress).toBe(100);
      expect(state.ocrData[1].text).toBe('Extracted text content');
      expect(state.pollingDocuments).not.toContain(1);
    });

    it('should handle failed OCR processing workflow', () => {
      // 1. Start processing
      store.dispatch(
        setOcrStatus({ documentId: 1, status: 'processing', progress: 30 })
      );
      store.dispatch(startPolling({ documentId: 1 }));

      // 2. Processing fails
      store.dispatch(
        setOcrError({ documentId: 1, error: 'File format not supported' })
      );
      store.dispatch(stopPolling({ documentId: 1 }));

      const state = store.getState().ocr;
      expect(state.ocrData[1].status).toBe('failed');
      expect(state.ocrData[1].error).toBe('File format not supported');
      expect(state.pollingDocuments).not.toContain(1);
    });
  });
});
