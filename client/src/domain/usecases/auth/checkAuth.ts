import { authService } from '@/application/services/authService';
import { AuthResponse } from '@/types/auth.types';

export async function checkAuth(): Promise<AuthResponse> {
  return await authService.checkAuth();
} 