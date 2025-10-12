import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import store from '../store/index.js'

import App from './App.jsx'

if (window.Telegram?.WebApp) {
  window.Telegram.WebApp.ready()
  console.log('✅ Telegram SDK инициализирован')
  console.log('initData:', window.Telegram.WebApp.initData)
  console.log('version:', window.Telegram.WebApp.version)
} else {
  console.warn('Telegram WebApp не найден')
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
)
