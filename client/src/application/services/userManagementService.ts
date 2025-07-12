import axios from 'axios';
import { API_ROUTES } from '@/constants/routes';
import axiosInstance from '@/infrastructure/api/axios';
import { UserManagementState } from '@/types/user-management.types';

export const userManagementService = {
  async fetchUsers(page: number, limit: number, search: string): Promise<UserManagementState> {
    const response = await axiosInstance.get(API_ROUTES.USER_MANAGEMENT.BASE, {
      params: { page, limit, search },
    });
    return {
      users: response.data.data,
      total: response.data.total,
      loading: false,
      error: null,
      searchQuery: search,
      totalPages: response.data.totalPages,
      success: true,
      paginatedUsers: response.data.data,
      paginatedUsersLoading: false,
      paginatedUsersHasMore: response.data.total > page * limit,
      paginatedUsersPage: page,
      paginatedUsersError: null,
    };
  },
  async blockUser(id: string): Promise<any> {
    const response = await axiosInstance.patch(API_ROUTES.USER_MANAGEMENT.BY_ID(id), {
      isBlocked: true,
    });
    return response.data;
  },
  async unblockUser(id: string): Promise<any> {
    const response = await axiosInstance.patch(API_ROUTES.USER_MANAGEMENT.BY_ID(id), {
      isBlocked: false,
    });
    return response.data;
  },

  async updateProfile(data: {
    name: string;
    profession: string;
    bio: string;
    profileImage: string | null;
  }): Promise<any> {
    const response = await axiosInstance.put(API_ROUTES.USER_MANAGEMENT.UPDATE_PROFILE, data);
    return response.data;
  },

  async changePassword(data: { currentPassword: string; newPassword: string }): Promise<any> {
    const response = await axiosInstance.put(API_ROUTES.AUTH.CHANGE_PASSWORD, data);
    return response.data;
  },
  async fetchUserStats(): Promise<any> {
    const response = await axiosInstance.get(API_ROUTES.USER_MANAGEMENT.FETCH_STATS);
    return response.data;
  },
};
