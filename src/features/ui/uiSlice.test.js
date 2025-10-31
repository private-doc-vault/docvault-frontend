import uiReducer, {
  showToast,
  hideToast,
  clearAllToasts,
  selectToasts,
} from './uiSlice';

describe('uiSlice', () => {
  describe('reducers', () => {
    it('should return the initial state', () => {
      expect(uiReducer(undefined, { type: 'unknown' })).toEqual({
        toasts: [],
      });
    });

    describe('showToast', () => {
      it('should add a toast with default values', () => {
        const previousState = { toasts: [] };
        const action = showToast({ message: 'Test toast' });
        const state = uiReducer(previousState, action);

        expect(state.toasts).toHaveLength(1);
        expect(state.toasts[0]).toMatchObject({
          message: 'Test toast',
          variant: 'info',
          delay: 5000,
          autohide: true,
          show: true,
        });
        expect(state.toasts[0].id).toBeDefined();
      });

      it('should add a toast with custom variant', () => {
        const previousState = { toasts: [] };
        const action = showToast({
          message: 'Success message',
          variant: 'success',
        });
        const state = uiReducer(previousState, action);

        expect(state.toasts[0]).toMatchObject({
          message: 'Success message',
          variant: 'success',
        });
      });

      it('should add a toast with custom title', () => {
        const previousState = { toasts: [] };
        const action = showToast({
          message: 'Error occurred',
          variant: 'error',
          title: 'Operation Failed',
        });
        const state = uiReducer(previousState, action);

        expect(state.toasts[0]).toMatchObject({
          message: 'Error occurred',
          variant: 'error',
          title: 'Operation Failed',
        });
      });

      it('should add a toast with custom delay', () => {
        const previousState = { toasts: [] };
        const action = showToast({
          message: 'Custom delay',
          delay: 10000,
        });
        const state = uiReducer(previousState, action);

        expect(state.toasts[0].delay).toBe(10000);
      });

      it('should add a toast with autohide disabled', () => {
        const previousState = { toasts: [] };
        const action = showToast({
          message: 'No autohide',
          autohide: false,
        });
        const state = uiReducer(previousState, action);

        expect(state.toasts[0].autohide).toBe(false);
      });

      it('should add multiple toasts', () => {
        let state = { toasts: [] };

        state = uiReducer(state, showToast({ message: 'Toast 1' }));
        state = uiReducer(state, showToast({ message: 'Toast 2' }));
        state = uiReducer(state, showToast({ message: 'Toast 3' }));

        expect(state.toasts).toHaveLength(3);
        expect(state.toasts[0].message).toBe('Toast 1');
        expect(state.toasts[1].message).toBe('Toast 2');
        expect(state.toasts[2].message).toBe('Toast 3');
      });

      it('should generate unique IDs for each toast', () => {
        let state = { toasts: [] };

        state = uiReducer(state, showToast({ message: 'Toast 1' }));
        state = uiReducer(state, showToast({ message: 'Toast 2' }));

        expect(state.toasts[0].id).not.toBe(state.toasts[1].id);
      });
    });

    describe('hideToast', () => {
      it('should remove a specific toast by ID', () => {
        const toast1 = { id: 'toast-1', message: 'Toast 1', show: true };
        const toast2 = { id: 'toast-2', message: 'Toast 2', show: true };
        const toast3 = { id: 'toast-3', message: 'Toast 3', show: true };

        const previousState = { toasts: [toast1, toast2, toast3] };
        const action = hideToast('toast-2');
        const state = uiReducer(previousState, action);

        expect(state.toasts).toHaveLength(2);
        expect(state.toasts[0].id).toBe('toast-1');
        expect(state.toasts[1].id).toBe('toast-3');
      });

      it('should not remove other toasts', () => {
        const toast1 = { id: 'toast-1', message: 'Toast 1', show: true };
        const toast2 = { id: 'toast-2', message: 'Toast 2', show: true };

        const previousState = { toasts: [toast1, toast2] };
        const action = hideToast('toast-1');
        const state = uiReducer(previousState, action);

        expect(state.toasts).toHaveLength(1);
        expect(state.toasts[0].id).toBe('toast-2');
      });

      it('should handle hiding non-existent toast', () => {
        const toast1 = { id: 'toast-1', message: 'Toast 1', show: true };

        const previousState = { toasts: [toast1] };
        const action = hideToast('toast-999');
        const state = uiReducer(previousState, action);

        expect(state.toasts).toHaveLength(1);
        expect(state.toasts[0].id).toBe('toast-1');
      });
    });

    describe('clearAllToasts', () => {
      it('should remove all toasts', () => {
        const toast1 = { id: 'toast-1', message: 'Toast 1', show: true };
        const toast2 = { id: 'toast-2', message: 'Toast 2', show: true };
        const toast3 = { id: 'toast-3', message: 'Toast 3', show: true };

        const previousState = { toasts: [toast1, toast2, toast3] };
        const action = clearAllToasts();
        const state = uiReducer(previousState, action);

        expect(state.toasts).toHaveLength(0);
      });

      it('should work with empty toast array', () => {
        const previousState = { toasts: [] };
        const action = clearAllToasts();
        const state = uiReducer(previousState, action);

        expect(state.toasts).toHaveLength(0);
      });
    });
  });

  describe('selectors', () => {
    it('should select toasts from state', () => {
      const toast1 = { id: 'toast-1', message: 'Toast 1' };
      const toast2 = { id: 'toast-2', message: 'Toast 2' };

      const state = {
        ui: {
          toasts: [toast1, toast2],
        },
      };

      const toasts = selectToasts(state);
      expect(toasts).toHaveLength(2);
      expect(toasts[0].id).toBe('toast-1');
      expect(toasts[1].id).toBe('toast-2');
    });

    it('should return empty array when no toasts', () => {
      const state = {
        ui: {
          toasts: [],
        },
      };

      const toasts = selectToasts(state);
      expect(toasts).toHaveLength(0);
    });
  });

  describe('toast workflow', () => {
    it('should handle complete toast lifecycle', () => {
      let state = { toasts: [] };

      // Show a toast
      const showAction = showToast({
        message: 'Processing...',
        variant: 'info',
      });
      state = uiReducer(state, showAction);

      expect(state.toasts).toHaveLength(1);
      const toastId = state.toasts[0].id;

      // Hide the toast
      const hideAction = hideToast(toastId);
      state = uiReducer(state, hideAction);

      expect(state.toasts).toHaveLength(0);
    });

    it('should handle multiple toasts with different variants', () => {
      let state = { toasts: [] };

      state = uiReducer(
        state,
        showToast({ message: 'Info toast', variant: 'info' })
      );
      state = uiReducer(
        state,
        showToast({ message: 'Success toast', variant: 'success' })
      );
      state = uiReducer(
        state,
        showToast({ message: 'Error toast', variant: 'error' })
      );
      state = uiReducer(
        state,
        showToast({ message: 'Warning toast', variant: 'warning' })
      );

      expect(state.toasts).toHaveLength(4);
      expect(state.toasts[0].variant).toBe('info');
      expect(state.toasts[1].variant).toBe('success');
      expect(state.toasts[2].variant).toBe('error');
      expect(state.toasts[3].variant).toBe('warning');
    });
  });
});
