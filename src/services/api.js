import axios from 'axios';
import { clearSession } from './session';

// Use the Vite proxy to avoid depending on Docker's published port.
const api = axios.create({
  baseURL: '/api/v1',
  headers: { Accept: 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  const expiresAt = Number(localStorage.getItem('expiresAt'));
  if (token && expiresAt > Date.now()) {
    config.headers.Authorization = `Bearer ${token}`;
  } else if (token) {
    clearSession();
    window.dispatchEvent(new Event('session-expired'));
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !window.location.pathname.startsWith('/login')) {
      clearSession();
      window.dispatchEvent(new Event('session-expired'));
      window.location.assign('/login');
    }
    return Promise.reject(error);
  }
);

export default api;
