import axios from 'axios';

const instance = axios.create({
  baseURL: 'https://3226-109-75-62-2.ngrok-free.app',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true'
  }
});

instance.interceptors.request.use((config) => {
  const tg = window.Telegram?.WebApp;
  if (tg?.initData) {
    config.headers['X-Telegram-InitData'] = tg.initData;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default instance;
