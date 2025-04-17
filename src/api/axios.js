// src/api/axios.js
import axios from 'axios';

const instance = axios.create({
  baseURL: 'https://6012-109-75-62-2.ngrok-free.app', 
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true'
  }
});

export default instance;
