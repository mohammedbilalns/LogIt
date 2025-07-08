import {User} from "../types/user.types"

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  profileImage: string | null;
  verificationEmail: string | null;
  isInitialized: boolean;
  resendLoading: boolean;
  resetPasswordEmail: string | null;
  resetPasswordVerified: boolean;
}

export interface AuthResponse {
  user: User;
  token?: string;
  message?: string;
}