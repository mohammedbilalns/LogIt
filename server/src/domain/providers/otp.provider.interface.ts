import { OTP } from '../entities/otp.entity';

export interface IOTPService {
  generateOTP(): string;
  createOTP(email: string, type: 'verification' | 'reset'): Promise<OTP>;
  verifyOTP(email: string, otp: string, type: 'verification' | 'reset'): Promise<boolean>;
  resendOTP(email: string, type: 'verification' | 'reset'): Promise<OTP>;
  deleteOTP(email: string): Promise<void>;
  isOTPExpired(otp: OTP): boolean;
  hasMaxRetryAttempts(otp: OTP): boolean;
  hasValidOTP(email: string, type: 'verification' | 'reset'): Promise<boolean>;
} 