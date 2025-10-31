import { useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ocrApi from '../api/ocrApi';
import {
  setOcrStatus,
  startPolling,
  stopPolling,
  selectIsPolling,
  selectOcrStatus,
} from '../features/ocr/ocrSlice';

/**
 * useOcrPolling Hook
 *
 * Custom hook to poll OCR status for documents that are being processed.
 * Automatically starts/stops polling based on document status.
 *
 * Features:
 * - Polls every 2 seconds for documents in 'processing' or 'pending' status
 * - Automatically stops polling when status reaches 'completed' or 'failed'
 * - Updates Redux state with latest OCR status and progress
 * - Cleanup on unmount to prevent memory leaks
 *
 * @param {number|string} documentId - The document ID to poll
 * @param {Object} options - Configuration options
 * @param {boolean} options.enabled - Enable/disable polling (default: true)
 * @param {number} options.interval - Polling interval in milliseconds (default: 2000)
 * @param {function} options.onStatusChange - Callback when status changes
 * @param {function} options.onComplete - Callback when processing completes
 * @param {function} options.onError - Callback when processing fails
 *
 * @returns {Object} - Polling state and controls
 *   {
 *     isPolling: boolean,
 *     currentStatus: string,
 *     startPolling: function,
 *     stopPolling: function
 *   }
 */
const useOcrPolling = (
  documentId,
  options = {}
) => {
  const {
    enabled = true,
    interval = 2000, // 2 seconds
    onStatusChange = null,
    onComplete = null,
    onError = null,
  } = options;

  const dispatch = useDispatch();
  const isPolling = useSelector(selectIsPolling(documentId));
  const currentStatus = useSelector(selectOcrStatus(documentId));

  const intervalRef = useRef(null);
  const previousStatusRef = useRef(currentStatus);

  /**
   * Fetch OCR status from API and update Redux state
   */
  const fetchStatus = useCallback(async () => {
    try {
      const data = await ocrApi.fetchOcrStatus(documentId);

      // Update Redux state
      dispatch(
        setOcrStatus({
          documentId,
          status: data.status,
          progress: data.progress || 0,
          error: data.error || null,
          lastUpdated: new Date().toISOString(),
        })
      );

      // Call onStatusChange if status changed
      if (onStatusChange && previousStatusRef.current !== data.status) {
        onStatusChange(data.status, previousStatusRef.current);
        previousStatusRef.current = data.status;
      }

      // Check if processing is complete
      if (data.status === 'completed') {
        // Stop polling
        dispatch(stopPolling({ documentId }));

        // Call onComplete callback
        if (onComplete) {
          onComplete(data);
        }
      }

      // Check if processing failed
      if (data.status === 'failed') {
        // Stop polling
        dispatch(stopPolling({ documentId }));

        // Call onError callback
        if (onError) {
          onError(data.error || 'OCR processing failed');
        }
      }

      return data;
    } catch (error) {
      console.error(`Failed to fetch OCR status for document ${documentId}:`, error);

      // Stop polling on error
      dispatch(stopPolling({ documentId }));

      // Call onError callback
      if (onError) {
        onError(error.message || 'Failed to fetch OCR status');
      }

      return null;
    }
  }, [documentId, dispatch, onStatusChange, onComplete, onError]);

  /**
   * Start polling for OCR status
   */
  const startPollingFn = useCallback(() => {
    if (!documentId) return;

    // Mark as polling in Redux
    dispatch(startPolling({ documentId }));

    // Fetch immediately
    fetchStatus();

    // Set up interval for subsequent fetches
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      fetchStatus();
    }, interval);
  }, [documentId, dispatch, fetchStatus, interval]);

  /**
   * Stop polling for OCR status
   */
  const stopPollingFn = useCallback(() => {
    if (!documentId) return;

    // Clear interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Mark as not polling in Redux
    dispatch(stopPolling({ documentId }));
  }, [documentId, dispatch]);

  /**
   * Auto-start polling if enabled and status is processing/pending
   */
  useEffect(() => {
    if (!enabled || !documentId) return;

    // Only poll if status is processing or pending
    const shouldPoll =
      currentStatus === 'processing' || currentStatus === 'pending';

    if (shouldPoll && !isPolling) {
      startPollingFn();
    } else if (!shouldPoll && isPolling) {
      stopPollingFn();
    }

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [
    enabled,
    documentId,
    currentStatus,
    isPolling,
    startPollingFn,
    stopPollingFn,
  ]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      stopPollingFn();
    };
  }, [stopPollingFn]);

  return {
    isPolling,
    currentStatus,
    startPolling: startPollingFn,
    stopPolling: stopPollingFn,
    refetch: fetchStatus,
  };
};

export default useOcrPolling;
