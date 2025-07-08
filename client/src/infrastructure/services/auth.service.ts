import { AuthService } from '@/domain/services/auth.service';
import { User } from '@/domain/entities/user';
import axiosInstance from '@/infrastructure/api/axios';

export class AuthServiceImpl implements AuthService {
  async login(email: string, password: string): Promise<User> {
    const response = await axiosInstance.post('/auth/login', { email, password });
    return response.data.user;
  }

  async signup(name: string, email: string, password: string): Promise<User> {
    const response = await axiosInstance.post('/auth/signup', { name, email, password });
    return response.data.user;
  }

  async verifyEmail(email: string, otp: string): Promise<User> {
    const response = await axiosInstance.post('/auth/verify-otp', { email, otp });
    return response.data.user;
  }

  logout(): void {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  }

  async checkAuth(): Promise<User | null> {
    try {
      const response = await axiosInstance.get('/auth/me');
      return response.data.user;
    } catch (error) {
      return null;
    }
  }

  async resendOTP(email: string): Promise<{ message: string }> {
    const response = await axiosInstance.post('/auth/resend-otp', { email });
    return response.data;
  }

  async googleAuth(credential: string): Promise<User> {
    const response = await axiosInstance.post('/auth/google', { credential });
    return response.data.user;
  }

  async initiatePasswordReset(email: string): Promise<{ email: string; message: string }> {
    const response = await axiosInstance.post('/auth/forgot-password', { email });
    return response.data;
  }

  async verifyResetOTP(email: string, otp: string): Promise<{ email: string; message: string }> {
    const response = await axiosInstance.post('/auth/verify-resetotp', { email, otp });
    return response.data;
  }

  async updatePassword(email: string, otp: string, newPassword: string): Promise<User> {
    const response = await axiosInstance.post('/auth/reset-password', { email, otp, newPassword });
    return response.data.user;
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<User> {
    const response = await axiosInstance.post('/auth/change-password', { currentPassword, newPassword });
    return response.data.user;
  }
}

// Export singleton instance
export const authService = new AuthServiceImpl(); 