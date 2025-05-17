export interface OTP {
  id?: string;
  email: string;
  otp: string;
  createdAt: Date;
  expiresAt: Date;
} 