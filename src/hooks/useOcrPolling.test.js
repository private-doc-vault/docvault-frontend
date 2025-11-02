import { renderHook, act, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import ocrReducer from '../features/ocr/ocrSlice';
import useOcrPolling from './useOcrPolling';
import ocrApi from '../api/ocrApi';

// Mock the ocrApi
jest.mock('../api/ocrApi');

// Helper to create a Redux store wrapper
const createWrapper = (initialState = {}) => {
  const store = configureStore({
    reducer: {
      ocr: ocrReducer,
    },
    preloadedState: initialState,
  });

  const Wrapper = ({ children }) => (
    <Provider store={store}>{children}</Provider>
  );
  Wrapper.displayName = 'ReduxWrapper';
  return Wrapper;
};

describe('useOcrPolling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('should initialize with correct default values', () => {
    const { result } = renderHook(() => useOcrPolling(1, { enabled: false }), {
      wrapper: createWrapper(),
    });

    expect(result.current.isPolling).toBe(false);
    expect(result.current.currentStatus).toBeNull();
    expect(typeof result.current.startPolling).toBe('function');
    expect(typeof result.current.stopPolling).toBe('function');
    expect(typeof result.current.refetch).toBe('function');
  });

  it('should start polling for processing documents', async () => {
    ocrApi.fetchOcrStatus.mockResolvedValue({
      status: 'processing',
      progress: 50,
    });

    const wrapper = createWrapper({
      ocr: {
        ocrData: {
          1: { status: 'processing', progress: 0 },
        },
        pollingDocuments: [],
        loading: false,
        error: null,
      },
    });

    const { result } = renderHook(
      () => useOcrPolling(1, { enabled: true, interval: 1000 }),
      { wrapper }
    );

    // Wait for initial fetch
    await waitFor(() => {
      expect(ocrApi.fetchOcrStatus).toHaveBeenCalledWith(1);
    });

    expect(result.current.isPolling).toBe(true);
  });

  it('should stop polling when status becomes completed', async () => {
    const onComplete = jest.fn();

    ocrApi.fetchOcrStatus.mockResolvedValue({
      status: 'completed',
      progress: 100,
    });

    const wrapper = createWrapper({
      ocr: {
        ocrData: {
          1: { status: 'processing', progress: 50 },
        },
        pollingDocuments: [], // Not polling initially
        loading: false,
        error: null,
      },
    });

    renderHook(() => useOcrPolling(1, { enabled: true, onComplete }), {
      wrapper,
    });

    await waitFor(() => {
      expect(ocrApi.fetchOcrStatus).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(onComplete).toHaveBeenCalled();
    });
  });

  it('should stop polling when status becomes failed', async () => {
    const onError = jest.fn();

    ocrApi.fetchOcrStatus.mockResolvedValue({
      status: 'failed',
      error: 'Processing failed',
    });

    const wrapper = createWrapper({
      ocr: {
        ocrData: {
          1: { status: 'processing', progress: 30 },
        },
        pollingDocuments: [], // Not polling initially
        loading: false,
        error: null,
      },
    });

    renderHook(() => useOcrPolling(1, { enabled: true, onError }), { wrapper });

    await waitFor(() => {
      expect(ocrApi.fetchOcrStatus).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith('Processing failed');
    });
  });

  it('should call onStatusChange when status changes', async () => {
    const onStatusChange = jest.fn();

    // First return processing, then completed
    ocrApi.fetchOcrStatus
      .mockResolvedValueOnce({
        status: 'processing',
        progress: 50,
      })
      .mockResolvedValueOnce({
        status: 'completed',
        progress: 100,
      });

    const wrapper = createWrapper({
      ocr: {
        ocrData: {
          1: { status: 'pending', progress: 0 },
        },
        pollingDocuments: [], // Not polling initially
        loading: false,
        error: null,
      },
    });

    renderHook(() => useOcrPolling(1, { enabled: true, onStatusChange }), {
      wrapper,
    });

    await waitFor(() => {
      expect(onStatusChange).toHaveBeenCalled();
    });
  });

  it('should not poll when enabled is false', () => {
    const { result } = renderHook(() => useOcrPolling(1, { enabled: false }), {
      wrapper: createWrapper({
        ocr: {
          ocrData: {
            1: { status: 'processing', progress: 50 },
          },
          pollingDocuments: [],
          loading: false,
          error: null,
        },
      }),
    });

    expect(result.current.isPolling).toBe(false);
    expect(ocrApi.fetchOcrStatus).not.toHaveBeenCalled();
  });

  it('should not poll for completed documents', () => {
    const { result } = renderHook(() => useOcrPolling(1, { enabled: true }), {
      wrapper: createWrapper({
        ocr: {
          ocrData: {
            1: { status: 'completed', progress: 100 },
          },
          pollingDocuments: [],
          loading: false,
          error: null,
        },
      }),
    });

    expect(result.current.isPolling).toBe(false);
    expect(ocrApi.fetchOcrStatus).not.toHaveBeenCalled();
  });

  it('should not poll for failed documents', () => {
    const { result } = renderHook(() => useOcrPolling(1, { enabled: true }), {
      wrapper: createWrapper({
        ocr: {
          ocrData: {
            1: { status: 'failed', error: 'Error' },
          },
          pollingDocuments: [],
          loading: false,
          error: null,
        },
      }),
    });

    expect(result.current.isPolling).toBe(false);
    expect(ocrApi.fetchOcrStatus).not.toHaveBeenCalled();
  });

  it.skip('should handle API errors gracefully', async () => {
    const onError = jest.fn();
    const consoleError = jest.spyOn(console, 'error').mockImplementation();

    ocrApi.fetchOcrStatus.mockRejectedValue(new Error('API request failed'));

    const wrapper = createWrapper({
      ocr: {
        ocrData: {
          1: { status: 'processing', progress: 50 },
        },
        pollingDocuments: [], // Not polling initially
        loading: false,
        error: null,
      },
    });

    renderHook(() => useOcrPolling(1, { enabled: true, onError }), { wrapper });

    await waitFor(() => {
      expect(onError).toHaveBeenCalled();
    });

    consoleError.mockRestore();
  });

  it('should cleanup polling on unmount', async () => {
    ocrApi.fetchOcrStatus.mockResolvedValue({
      status: 'processing',
      progress: 50,
    });

    const wrapper = createWrapper({
      ocr: {
        ocrData: {
          1: { status: 'processing', progress: 50 },
        },
        pollingDocuments: [], // Not polling initially
        loading: false,
        error: null,
      },
    });

    const { unmount } = renderHook(
      () => useOcrPolling(1, { enabled: true, interval: 1000 }),
      { wrapper }
    );

    await waitFor(() => {
      expect(ocrApi.fetchOcrStatus).toHaveBeenCalled();
    });

    // Unmount should clean up interval
    unmount();

    // Clear any pending timers
    act(() => {
      jest.runOnlyPendingTimers();
    });
  });

  it('should allow manual start and stop polling', async () => {
    ocrApi.fetchOcrStatus.mockResolvedValue({
      status: 'processing',
      progress: 50,
    });

    const wrapper = createWrapper();

    const { result } = renderHook(() => useOcrPolling(1, { enabled: false }), {
      wrapper,
    });

    expect(result.current.isPolling).toBe(false);

    // Manually start polling
    act(() => {
      result.current.startPolling();
    });

    await waitFor(() => {
      expect(result.current.isPolling).toBe(true);
    });

    // Manually stop polling
    act(() => {
      result.current.stopPolling();
    });

    expect(result.current.isPolling).toBe(false);
  });

  it('should support manual refetch', async () => {
    ocrApi.fetchOcrStatus.mockResolvedValue({
      status: 'processing',
      progress: 75,
    });

    const wrapper = createWrapper();

    const { result } = renderHook(() => useOcrPolling(1, { enabled: false }), {
      wrapper,
    });

    // Manual refetch
    await act(async () => {
      await result.current.refetch();
    });

    expect(ocrApi.fetchOcrStatus).toHaveBeenCalledWith(1);
  });

  it.skip('should use custom polling interval', async () => {
    ocrApi.fetchOcrStatus.mockResolvedValue({
      status: 'processing',
      progress: 50,
    });

    const wrapper = createWrapper({
      ocr: {
        ocrData: {
          1: { status: 'processing', progress: 50 },
        },
        pollingDocuments: [], // Not polling initially
        loading: false,
        error: null,
      },
    });

    renderHook(() => useOcrPolling(1, { enabled: true, interval: 5000 }), {
      wrapper,
    });

    // Wait for initial fetch
    await waitFor(() => {
      expect(ocrApi.fetchOcrStatus).toHaveBeenCalledTimes(1);
    });

    // Fast-forward 4 seconds (should not trigger another call)
    act(() => {
      jest.advanceTimersByTime(4000);
    });

    expect(ocrApi.fetchOcrStatus).toHaveBeenCalledTimes(1);

    // Fast-forward another 1 second (now should trigger)
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(ocrApi.fetchOcrStatus).toHaveBeenCalledTimes(2);
    });
  });
});
