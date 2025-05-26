export interface User {
  _id: string;
  name: string;
  email: string;
  isVerified: boolean;
  isBlocked: boolean; 
  createdAt: string;
  updatedAt: string;
  role: 'user' | 'admin' | 'superadmin';
  profession: string;
  bio: string;
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