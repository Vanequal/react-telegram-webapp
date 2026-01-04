import { useEffect, useState } from 'react';

/**
 * Hook для работы с темой Telegram WebApp
 */
export const useTelegramTheme = () => {
  const [theme, setTheme] = useState('light');
  const [themeParams, setThemeParams] = useState({});

  useEffect(() => {
    const tg = window.Telegram?.WebApp;

    if (tg) {
      const currentTheme = tg.colorScheme || 'light';
      setTheme(currentTheme);
      setThemeParams(tg.themeParams || {});

      tg.onEvent('themeChanged', () => {
        setTheme(tg.colorScheme);
        setThemeParams(tg.themeParams);
      });
    }
  }, []);

  return {
    theme,
    themeParams,
    isDark: theme === 'dark',
    bgColor: themeParams.bg_color || '#ffffff',
    textColor: themeParams.text_color || '#000000',
    hintColor: themeParams.hint_color || '#999999',
    linkColor: themeParams.link_color || '#2481cc',
    buttonColor: themeParams.button_color || '#2481cc',
    buttonTextColor: themeParams.button_text_color || '#ffffff'
  };
};

export default useTelegramTheme;
