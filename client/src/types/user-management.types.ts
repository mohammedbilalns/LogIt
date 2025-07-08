import {User} from "@type/user.types"
export interface UserManagementState {
  users: User[];
  total: number;
  loading: boolean;
  error: string | null;
  searchQuery: string;
  totalPages: number;
  success: boolean;
  paginatedUsers: User[];
  paginatedUsersLoading: boolean;
  paginatedUsersHasMore: boolean;
  paginatedUsersPage: number;
  paginatedUsersError: string | null;
}

export interface UpdateProfileData {
  name: string;
  profession: string;
  bio: string;
  profileImage: string | null;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}