import { userManagementServiceImpl } from '@/infrastructure/services/userManagement.service';
import { UserManagementState } from '@/types/user-management.types';

export const userManagementService = {
  fetchUsers: (page: number, limit: number, search: string): Promise<UserManagementState> => {
    return userManagementServiceImpl.fetchUsers(page, limit, search).then(result => ({
      users: result.users,
      total: result.total,
      loading: false,
      error: null,
      searchQuery: search,
      totalPages: Math.ceil(result.total / limit),
      success: true,
      paginatedUsers: result.users,
      paginatedUsersLoading: false,
      paginatedUsersHasMore: result.total > page * limit,
      paginatedUsersPage: page,
      paginatedUsersError: null,
    }));
  },
  blockUser: (id: string): Promise<any> => {
    return userManagementServiceImpl.blockUser(id);
  },
  unblockUser: (id: string): Promise<any> => {
    return userManagementServiceImpl.unblockUser(id);
  },
  updateProfile: (data: { name: string; profession: string; bio: string; profileImage: string | null }): Promise<any> => {
    return userManagementServiceImpl.updateProfile(data);
  },
  changePassword: (data: { currentPassword: string; newPassword: string }): Promise<any> => {
    return userManagementServiceImpl.changePassword(data);
  },
  fetchUserStats: (): Promise<any> => {
    return userManagementServiceImpl.fetchUserStats();
  },
}; 