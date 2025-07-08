import { authService } from '@/application/services/authService';
import { AuthResponse } from '@/types/auth.types';

export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  return await authService.login(email, password);
} 