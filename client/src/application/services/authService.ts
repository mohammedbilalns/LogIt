import { API_ROUTES } from '@/constants/routes';
import api from '@/infrastructure/api/axios';
import { AuthResponse } from '@/types/auth.types';

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>(API_ROUTES.AUTH.LOGIN, { email, password });
    return res.data;
  },
  async signup(name: string, email: string, password: string): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>(API_ROUTES.AUTH.SIGNUP, { name, email, password });
    return res.data;
  },
  async verifyEmail(email: string, otp: string): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>(API_ROUTES.AUTH.VERIFY_OTP, { email, otp });
    return res.data;
  },
  async logout(): Promise<{ message: string }> {
    const res = await api.post<{ message: string }>(API_ROUTES.AUTH.LOGOUT, {});
    return res.data;
  },
  async checkAuth(): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>(API_ROUTES.AUTH.REFRESH);
    return res.data;
  },
  async resendOTP(email: string): Promise<{ message: string }> {
    const res = await api.post<{ message: string }>(API_ROUTES.AUTH.RESEND_OTP, { email });
    return res.data;
  },
  async googleAuth(credential: string): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>(API_ROUTES.AUTH.GOOGLE, { credential });
    return res.data;
  },
  async initiatePasswordReset(email: string): Promise<{ email: string; message: string }> {
    const res = await api.post<{ email: string; message: string }>(API_ROUTES.AUTH.RESET_PASSWORD, {
      email,
    });
    return res.data;
  },
  async verifyResetOTP(email: string, otp: string): Promise<{ email: string; message: string }> {
    const res = await api.post<{ email: string; message: string }>(API_ROUTES.AUTH.VERIFY_RESET_OTP, {
      email,
      otp,
    });
    return res.data;
  },
  async updatePassword(email: string, otp: string, newPassword: string): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>(API_ROUTES.AUTH.RESET_PASSWORD, {
      email,
      otp,
      newPassword,
    });
    return res.data;
  },
  async changePassword(currentPassword: string, newPassword: string): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>(API_ROUTES.AUTH.CHANGE_PASSWORD, {
      currentPassword,
      newPassword,
    });
    return res.data;
  },
};
