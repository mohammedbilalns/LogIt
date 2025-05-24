export interface User {
  _id: string;
  name: string;
  email: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  role: 'user' | 'admin' | 'superadmin';
  profileImage?: string;
}

export interface AuthResponse {
  user: User;
  csrfToken: string;
  message: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
}

export interface VerifyEmailRequest {
  email: string;
  otp: string;
} 