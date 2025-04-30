import axios from 'axios';

const instance = axios.create({
  baseURL: 'https://7b8a-109-75-62-2.ngrok-free.app',
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true'
  }
});

instance.interceptors.request.use((config) => {
  const tg = window.Telegram?.WebApp;
  const token = sessionStorage.getItem('token'); 

  if (tg?.initData) {
    config.headers['X-Telegram-InitData'] = tg.initData;
  }

  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

export default instance;
