import { useEffect } from 'react';

export const useTelegramWebApp = () => {
  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      try {
        tg.ready();
        tg.expand();
        tg.requestWriteAccess?.();
      } catch (err) {
        console.warn('[Telegram WebApp] initialization error:', err.message);
      }
    }
  }, []);

  return window.Telegram?.WebApp || null;
};