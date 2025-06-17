export interface FetchUsersOptions {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface UserResponse {
  id?: string;
  name: string;
  email: string;
  isVerified: boolean;
  isBlocked?: boolean;
  googleId?: string;
  profileImage?: string;
  profession?: string;
  bio?: string;
  provider?: "local" | "google";
  role: "user" | "admin" | "superadmin";
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  isVerified?: boolean;
  isBlocked?: boolean;
  role?: "user" | "admin" | "superadmin";
  profession?: string;
  bio?: string;
  profileImage?: string;
}

export interface UsersListResponse {
  data: UserResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
} 