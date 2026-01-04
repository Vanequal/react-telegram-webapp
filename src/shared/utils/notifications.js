import logger from './logger';

export const showError = (message, error = null) => {
  if (error) {
    logger.error('Error:', error);
  }

  const tg = window.Telegram?.WebApp;
  if (tg?.showAlert) {
    tg.showAlert(message);
  } else {
    alert(message);
  }
};

export const showSuccess = (message) => {
  const tg = window.Telegram?.WebApp;
  if (tg?.showAlert) {
    tg.showAlert(message);
  }
};

export const showConfirm = (message, callback) => {
  const tg = window.Telegram?.WebApp;
  if (tg?.showConfirm) {
    tg.showConfirm(message, callback);
  } else {
    const result = confirm(message);
    callback(result);
  }
};

export default {
  showError,
  showSuccess,
  showConfirm
};
