import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add CSRF token
axiosInstance.interceptors.request.use(
  (config) => {
    // Skip CSRF token for public endpoints
    const skipCsrfEndpoints = [
      '/auth/login',
      '/auth/signup',
      '/auth/verify-otp',
      '/auth/reset-password',
      '/auth/verify-resetotp',
      '/auth/update-password'
    ];
    if (skipCsrfEndpoints.some(endpoint => config.url?.endsWith(endpoint))) {
      return config;
    }

    // Get CSRF token from cookie
    const csrfToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('csrf-token='))
      ?.split('=')[1];

    if (csrfToken) {
      config.headers['x-csrf-token'] = csrfToken;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance; 