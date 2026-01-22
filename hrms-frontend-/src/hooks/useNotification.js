import { toast } from 'react-toastify';

const useNotification = () => {
  const showSuccess = (message) => {
    toast.success(message);
  };

  const showError = (message) => {
    toast.error(message);
  };

  const showWarning = (message) => {
    toast.warning(message);
  };

  const showInfo = (message) => {
    toast.info(message);
  };

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
};

export default useNotification;
