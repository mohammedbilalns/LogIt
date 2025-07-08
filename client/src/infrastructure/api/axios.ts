import axios, { AxiosError } from 'axios';
import { AppDispatch } from '@/infrastructure/store';
import { logout } from '@/infrastructure/store/slices/authSlice';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

const SKIP_AUTH_ROUTES = [
  '/auth/login',
  '/auth/reset-password',
  '/auth/verify-otp',
  '/auth/resend-otp',
  '/auth/verify-resetotp',
];
 

// Request interceptor to add CSRF token
axiosInstance.interceptors.request.use(
  (config) => {
    const skipMethods = ['get', 'head', 'options'];
    const method = config.method?.toLowerCase() || '';
    if (skipMethods.includes(method)) {
      return config;
    }

    // Get CSRF token from cookie
    const csrfToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('csrfToken='))
      ?.split('=')[1];

    if (csrfToken) {
      config.headers['x-csrf-token'] = csrfToken;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown | null = null, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

//  response interceptor
export const setupAxiosInterceptors = (store: { dispatch: AppDispatch }) => {
  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config;
      if (!originalRequest) {
        return Promise.reject(error);
      }

      const status = error.response?.status;
      const message = (error.response?.data as any)?.message;

      // Handle blocked user
      if (
        status === 403 &&
        message === 'User is blocked'
      ) {
        store.dispatch(logout());
        window.location.href = '/login?error=blocked';
        return Promise.reject(error);
      }

      // Only attempt refresh if status is 401 and message matches
      if (
        status !== 401 ||
        message !== 'Authentication required' ||
        originalRequest.url?.includes('/auth/refresh')
      ) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;

      try {
        const response = await axiosInstance.post('/auth/refresh');
        const { accessToken } = response.data;

        processQueue(null, accessToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        return axiosInstance(originalRequest);
      } catch (refreshError: unknown) {
        processQueue(refreshError, null);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
  );
};

export default axiosInstance; 