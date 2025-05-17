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
    // Skip CSRF token for certain endpoints
    const skipCsrfEndpoints = ['/auth/login', '/auth/signup', '/auth/verify-otp'];
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

// Response interceptor to handle token refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error is not 401 or it's already retried, reject immediately
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Don't retry these endpoints to prevent infinite loops
    const noRetryEndpoints = ['/auth/refresh', '/auth/login', '/auth/signup'];
    if (noRetryEndpoints.some(endpoint => originalRequest.url?.endsWith(endpoint))) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      await axios.post(
        `${API_URL}/auth/refresh`,
        {},
        { withCredentials: true }
      );
      return axiosInstance(originalRequest);
    } catch (refreshError) {
      return Promise.reject(refreshError);
    }
  }
);

export default axiosInstance; 