export interface User {
  id?: string;
  name: string;
  email: string;
  password: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserResponse extends Omit<User, 'password'> {
  id: string;
}

export interface SignupRequest extends Omit<User, 'id' | 'createdAt' | 'updatedAt'> {}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: UserResponse;
  csrfToken: string;
}

export interface ErrorResponse {
  message: string;
}

export type ApiResponse<T> = T | ErrorResponse; 