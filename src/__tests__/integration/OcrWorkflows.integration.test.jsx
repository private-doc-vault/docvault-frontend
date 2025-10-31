import { configureStore } from '@reduxjs/toolkit';
import rootReducer from '../../store/rootReducer';
import {
  setOcrStatus,
  updateProgress,
  setOcrText,
  setOcrError,
  startPolling,
  stopPolling,
} from '../../features/ocr/ocrSlice';
import ocrApi from '../../api/ocrApi';

// Mock the ocrApi
jest.mock('../../api/ocrApi');

describe('OCR Workflow Integration Tests', () => {
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: rootReducer,
    });
    jest.clearAllMocks();
  });

  describe('OCR Processing Status Workflow', () => {
    it('should handle complete OCR processing from pending to completed', () => {
      const documentId = 1;

      // 1. Document uploaded, OCR status is pending
      store.dispatch(
        setOcrStatus({
          documentId,
          status: 'pending',
          progress: 0,
        })
      );

      let state = store.getState().ocr;
      expect(state.ocrData[documentId].status).toBe('pending');
      expect(state.ocrData[documentId].progress).toBe(0);

      // 2. OCR processing starts
      store.dispatch(
        setOcrStatus({
          documentId,
          status: 'processing',
          progress: 10,
        })
      );
      store.dispatch(startPolling({ documentId }));

      state = store.getState().ocr;
      expect(state.ocrData[documentId].status).toBe('processing');
      expect(state.pollingDocuments).toContain(documentId);

      // 3. Progress updates during processing
      store.dispatch(updateProgress({ documentId, progress: 25 }));
      store.dispatch(updateProgress({ documentId, progress: 50 }));
      store.dispatch(updateProgress({ documentId, progress: 75 }));

      state = store.getState().ocr;
      expect(state.ocrData[documentId].progress).toBe(75);

      // 4. OCR processing completes
      store.dispatch(
        setOcrStatus({
          documentId,
          status: 'completed',
          progress: 100,
        })
      );
      store.dispatch(
        setOcrText({
          documentId,
          text: 'Extracted OCR text content from document',
        })
      );
      store.dispatch(stopPolling({ documentId }));

      state = store.getState().ocr;
      expect(state.ocrData[documentId].status).toBe('completed');
      expect(state.ocrData[documentId].progress).toBe(100);
      expect(state.ocrData[documentId].text).toBe(
        'Extracted OCR text content from document'
      );
      expect(state.pollingDocuments).not.toContain(documentId);
    });

    it('should handle failed OCR processing', () => {
      const documentId = 2;

      // 1. Document uploaded and processing starts
      store.dispatch(
        setOcrStatus({
          documentId,
          status: 'processing',
          progress: 30,
        })
      );
      store.dispatch(startPolling({ documentId }));

      let state = store.getState().ocr;
      expect(state.ocrData[documentId].status).toBe('processing');
      expect(state.pollingDocuments).toContain(documentId);

      // 2. OCR processing fails
      store.dispatch(
        setOcrError({
          documentId,
          error: 'Unsupported file format',
        })
      );
      store.dispatch(stopPolling({ documentId }));

      state = store.getState().ocr;
      expect(state.ocrData[documentId].status).toBe('failed');
      expect(state.ocrData[documentId].error).toBe('Unsupported file format');
      expect(state.pollingDocuments).not.toContain(documentId);
    });
  });

  describe('OCR Retry Workflow', () => {
    it('should handle complete retry workflow from failed to completed', async () => {
      const documentId = 3;

      // 1. Initial failed state
      store.dispatch(
        setOcrError({
          documentId,
          error: 'Processing timeout',
        })
      );

      let state = store.getState().ocr;
      expect(state.ocrData[documentId].status).toBe('failed');
      expect(state.ocrData[documentId].error).toBe('Processing timeout');

      // 2. User clicks retry button
      ocrApi.retryOcrProcessing.mockResolvedValue({
        message: 'OCR processing restarted',
        status: 'pending',
      });

      await ocrApi.retryOcrProcessing(documentId);

      // 3. Status resets to pending
      store.dispatch(
        setOcrStatus({
          documentId,
          status: 'pending',
          progress: 0,
          error: null,
        })
      );

      state = store.getState().ocr;
      expect(state.ocrData[documentId].status).toBe('pending');
      expect(state.ocrData[documentId].error).toBeNull();

      // 4. Processing starts again
      store.dispatch(
        setOcrStatus({
          documentId,
          status: 'processing',
          progress: 20,
        })
      );
      store.dispatch(startPolling({ documentId }));

      state = store.getState().ocr;
      expect(state.ocrData[documentId].status).toBe('processing');
      expect(state.pollingDocuments).toContain(documentId);

      // 5. This time processing completes successfully
      store.dispatch(
        setOcrStatus({
          documentId,
          status: 'completed',
          progress: 100,
        })
      );
      store.dispatch(
        setOcrText({
          documentId,
          text: 'Successfully extracted text after retry',
        })
      );
      store.dispatch(stopPolling({ documentId }));

      state = store.getState().ocr;
      expect(state.ocrData[documentId].status).toBe('completed');
      expect(state.ocrData[documentId].text).toBe(
        'Successfully extracted text after retry'
      );
      expect(state.pollingDocuments).not.toContain(documentId);
    });
  });

  describe('Multiple Document OCR Workflow', () => {
    it('should handle OCR processing for multiple documents simultaneously', () => {
      const doc1 = 10;
      const doc2 = 11;
      const doc3 = 12;

      // 1. Start processing for multiple documents
      store.dispatch(
        setOcrStatus({ documentId: doc1, status: 'processing', progress: 10 })
      );
      store.dispatch(
        setOcrStatus({ documentId: doc2, status: 'processing', progress: 5 })
      );
      store.dispatch(
        setOcrStatus({ documentId: doc3, status: 'processing', progress: 15 })
      );

      store.dispatch(startPolling({ documentId: doc1 }));
      store.dispatch(startPolling({ documentId: doc2 }));
      store.dispatch(startPolling({ documentId: doc3 }));

      let state = store.getState().ocr;
      expect(state.pollingDocuments).toHaveLength(3);
      expect(state.pollingDocuments).toContain(doc1);
      expect(state.pollingDocuments).toContain(doc2);
      expect(state.pollingDocuments).toContain(doc3);

      // 2. Doc1 completes
      store.dispatch(
        setOcrStatus({ documentId: doc1, status: 'completed', progress: 100 })
      );
      store.dispatch(stopPolling({ documentId: doc1 }));

      state = store.getState().ocr;
      expect(state.ocrData[doc1].status).toBe('completed');
      expect(state.pollingDocuments).not.toContain(doc1);
      expect(state.pollingDocuments).toHaveLength(2);

      // 3. Doc2 fails
      store.dispatch(
        setOcrError({ documentId: doc2, error: 'Processing error' })
      );
      store.dispatch(stopPolling({ documentId: doc2 }));

      state = store.getState().ocr;
      expect(state.ocrData[doc2].status).toBe('failed');
      expect(state.pollingDocuments).not.toContain(doc2);
      expect(state.pollingDocuments).toHaveLength(1);

      // 4. Doc3 still processing and eventually completes
      store.dispatch(updateProgress({ documentId: doc3, progress: 50 }));
      store.dispatch(updateProgress({ documentId: doc3, progress: 80 }));
      store.dispatch(
        setOcrStatus({ documentId: doc3, status: 'completed', progress: 100 })
      );
      store.dispatch(stopPolling({ documentId: doc3 }));

      state = store.getState().ocr;
      expect(state.ocrData[doc3].status).toBe('completed');
      expect(state.pollingDocuments).toHaveLength(0);
    });
  });

  describe('OCR Text Retrieval Workflow', () => {
    it('should fetch and display OCR text for completed documents', async () => {
      const documentId = 20;

      // 1. Document is marked as completed
      store.dispatch(
        setOcrStatus({
          documentId,
          status: 'completed',
          progress: 100,
        })
      );

      // 2. Fetch OCR text from API
      ocrApi.fetchOcrText.mockResolvedValue({
        text: 'This is the extracted OCR text from the document.',
        confidence: 0.95,
        language: 'en',
        pageCount: 1,
      });

      const response = await ocrApi.fetchOcrText(documentId);

      // 3. Store OCR text in Redux
      store.dispatch(
        setOcrText({
          documentId,
          text: response.text,
        })
      );

      const state = store.getState().ocr;
      expect(state.ocrData[documentId].text).toBe(
        'This is the extracted OCR text from the document.'
      );
    });
  });

  describe('OCR Status Polling Workflow', () => {
    it('should simulate polling status updates until completion', async () => {
      const documentId = 30;

      // Mock API responses for polling
      const statusUpdates = [
        { status: 'processing', progress: 20 },
        { status: 'processing', progress: 40 },
        { status: 'processing', progress: 60 },
        { status: 'processing', progress: 80 },
        { status: 'completed', progress: 100 },
      ];

      ocrApi.fetchOcrStatus
        .mockResolvedValueOnce(statusUpdates[0])
        .mockResolvedValueOnce(statusUpdates[1])
        .mockResolvedValueOnce(statusUpdates[2])
        .mockResolvedValueOnce(statusUpdates[3])
        .mockResolvedValueOnce(statusUpdates[4]);

      // 1. Start polling
      store.dispatch(startPolling({ documentId }));

      // 2. Simulate polling iterations
      for (let i = 0; i < statusUpdates.length; i++) {
        const update = await ocrApi.fetchOcrStatus(documentId);

        store.dispatch(
          setOcrStatus({
            documentId,
            status: update.status,
            progress: update.progress,
          })
        );

        // If completed, stop polling
        if (update.status === 'completed') {
          store.dispatch(stopPolling({ documentId }));
          break;
        }
      }

      // 3. Verify final state
      const state = store.getState().ocr;
      expect(state.ocrData[documentId].status).toBe('completed');
      expect(state.ocrData[documentId].progress).toBe(100);
      expect(state.pollingDocuments).not.toContain(documentId);
    });
  });

  describe('Error Recovery Workflow', () => {
    it('should handle transient errors and retry automatically', async () => {
      const documentId = 40;

      // 1. Start processing
      store.dispatch(
        setOcrStatus({
          documentId,
          status: 'processing',
          progress: 30,
        })
      );
      store.dispatch(startPolling({ documentId }));

      // 2. API call fails (transient error)
      ocrApi.fetchOcrStatus.mockRejectedValueOnce(
        new Error('Network timeout')
      );

      try {
        await ocrApi.fetchOcrStatus(documentId);
      } catch (error) {
        // Error logged but polling continues
        expect(error.message).toBe('Network timeout');
      }

      // 3. Next poll succeeds
      ocrApi.fetchOcrStatus.mockResolvedValueOnce({
        status: 'processing',
        progress: 50,
      });

      const update = await ocrApi.fetchOcrStatus(documentId);
      store.dispatch(
        setOcrStatus({
          documentId,
          status: update.status,
          progress: update.progress,
        })
      );

      // 4. Processing continues normally
      const state = store.getState().ocr;
      expect(state.ocrData[documentId].status).toBe('processing');
      expect(state.ocrData[documentId].progress).toBe(50);
    });
  });

  describe('Cleanup Workflow', () => {
    it('should clean up OCR data and stop polling when document is deleted', () => {
      const documentId = 50;

      // 1. Document is being processed
      store.dispatch(
        setOcrStatus({
          documentId,
          status: 'processing',
          progress: 45,
        })
      );
      store.dispatch(startPolling({ documentId }));

      let state = store.getState().ocr;
      expect(state.ocrData[documentId]).toBeDefined();
      expect(state.pollingDocuments).toContain(documentId);

      // 2. Document is deleted - cleanup
      store.dispatch(stopPolling({ documentId }));
      store.dispatch({ type: 'ocr/clearOcrData', payload: { documentId } });

      state = store.getState().ocr;
      expect(state.ocrData[documentId]).toBeUndefined();
      expect(state.pollingDocuments).not.toContain(documentId);
    });
  });
});
