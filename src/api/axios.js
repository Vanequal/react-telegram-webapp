import axios from 'axios';

const instance = axios.create({
  baseURL: 'https://tight-guarantees-discs-announcement.trycloudflare.com',
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true'
  }
});

instance.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token');

  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
    config.headers['WWW-Authenticate'] = `Bearer ${token}`;
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

export default instance;
