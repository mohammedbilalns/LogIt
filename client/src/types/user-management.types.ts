import {User} from "@type/user.types"
export interface UserManagementState {
  users: User[];
  total: number;
  loading: boolean;
  error: string | null;
  searchQuery: string;
  totalPages: number;
  success: boolean;
}