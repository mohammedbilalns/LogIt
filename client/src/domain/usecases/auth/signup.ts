import { authService } from '@/application/services/authService';
import { AuthResponse } from '@/types/auth.types';

export async function signupUser(name: string, email: string, password: string): Promise<AuthResponse> {
  return await authService.signup(name, email, password);
} 