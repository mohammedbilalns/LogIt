import { z } from 'zod';

export interface SignupData {
  name: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export class ValidationService {
  private signupSchema = z.object({
    name: z.string().min(2).trim(),
    email: z.string().email().trim().toLowerCase(),
    password: z.string().min(8)
  });

  private loginSchema = z.object({
    email: z.string().email().trim().toLowerCase(),
    password: z.string()
  });

  validateSignupData(data: SignupData): SignupData {
    return this.signupSchema.parse(data);
  }

  validateLoginData(data: LoginData): LoginData {
    return this.loginSchema.parse(data);
  }
} 