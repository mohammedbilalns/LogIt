import { z } from 'zod';

export const signupSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(20, 'Name must not exceed 20 characters'),
  email: z.string()
    .email('Invalid email address')
    .min(1, 'Email is required'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.])[A-Za-z\d@$!%*?&.]{8,}$/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),
});

export const loginSchema = z.object({
  email: z.string()
    .email('Invalid email address')
    .min(1, 'Email is required'),
  password: z.string()
    .min(1, 'Password is required'),
});

export const verifyOTPSchema = z.object({
  email: z.string()
    .email('Invalid email address')
    .min(1, 'Email is required'),
  otp: z.string()
    .length(6, 'OTP must be 6 digits')
    .regex(/^\d+$/, 'OTP must contain only digits'),
});

export const resendOTPSchema = z.object({
  email: z.string()
    .email('Invalid email address')
    .min(1, 'Email is required'),
});

export const resetPasswordSchema = z.object({
  email: z.string()
    .email('Invalid email address')
    .min(1, 'Email is required'),
});

export const updatePasswordSchema = z.object({
  email: z.string()
    .email('Invalid email address')
    .min(1, 'Email is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.])[A-Za-z\d@$!%*?&.]{8,}$/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),
});

export const googleAuthSchema = z.object({
  credential: z.string()
    .min(1, 'Google credential is required'),
});