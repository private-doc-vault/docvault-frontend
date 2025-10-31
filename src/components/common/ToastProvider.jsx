import { useDispatch, useSelector } from 'react-redux';
import { selectToasts, hideToast } from '../../features/ui/uiSlice';
import { ToastNotificationContainer } from './Toast';

/**
 * ToastProvider - Connects toast notifications to Redux store
 *
 * Renders all active toasts from Redux state in top-right corner
 * Should be placed at the root level of the app
 */
const ToastProvider = () => {
  const dispatch = useDispatch();
  const toasts = useSelector(selectToasts);

  const handleRemoveToast = (toastId) => {
    dispatch(hideToast(toastId));
  };

  return <ToastNotificationContainer toasts={toasts} onRemoveToast={handleRemoveToast} />;
};

export default ToastProvider;
