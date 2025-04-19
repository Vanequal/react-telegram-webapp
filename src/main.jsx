import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux';
import store from './store';

import React, { useEffect } from 'react';

import App from './App.jsx'

if (window.Telegram?.WebApp) {
  window.Telegram.WebApp.ready(); 
  console.log('initData:', window.Telegram.WebApp.initData); 
} else {
  console.warn('Telegram WebApp не найден');
}

useEffect(() => {
  console.log('Telegram SDK:', window.Telegram?.WebApp);
  console.log('version:', window.Telegram?.WebApp?.version); // должен быть 6.7+
}, []);


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
)
