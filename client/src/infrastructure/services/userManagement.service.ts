import axiosInstance from '@/infrastructure/api/axios';
import { API_ROUTES } from '@/constants/routes';
import { User } from '@/types/user.types';

export const userManagementServiceImpl = {
  async fetchUsers(page: number, limit: number, search: string): Promise<{ users: User[]; total: number }> {
    const response = await axiosInstance.get(API_ROUTES.USER_MANAGEMENT.BASE, {
      params: { page, limit, search },
    });
    return {
      users: response.data.data,
      total: response.data.total,
    };
  },
  blockUser: async (id: string): Promise<any> => {
    const response = await axiosInstance.patch(API_ROUTES.USER_MANAGEMENT.BY_ID(id), { isBlocked: true });
    return response.data;
  },
  unblockUser: async (id: string): Promise<any> => {
    const response = await axiosInstance.patch(API_ROUTES.USER_MANAGEMENT.BY_ID(id), { isBlocked: false });
    return response.data;
  },
  updateProfile: async (data: { name: string; profession: string; bio: string; profileImage: string | null }): Promise<any> => {
    const response = await axiosInstance.put(API_ROUTES.USER_MANAGEMENT.UPDATE_PROFILE, data);
    return response.data;
  },
  changePassword: async (data: { currentPassword: string; newPassword: string }): Promise<any> => {
    console.log('[service] changePassword data:', data);
    const response = await axiosInstance.put(API_ROUTES.AUTH.CHANGE_PASSWORD, data);
    console.log('[service] changePassword response:', response.data);
    return response.data;
  },
  fetchUserStats: async (): Promise<any> => {
    const response = await axiosInstance.get('/user/stats');
    return response.data;
  },
}; 