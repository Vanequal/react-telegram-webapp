import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import store from '@/store'
import logger from '@/shared/utils/logger'

import App from './App.jsx'

if (window.Telegram?.WebApp) {
  window.Telegram.WebApp.ready()
  logger.log('✅ Telegram SDK инициализирован')
  logger.log('initData:', window.Telegram.WebApp.initData)
  logger.log('version:', window.Telegram.WebApp.version)
} else {
  logger.warn('Telegram WebApp не найден')
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>
)
