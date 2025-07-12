import { API_ROUTES } from '@/constants/routes';
import axiosInstance from '@/infrastructure/api/axios';

export const connectionService = {
  async followUser(targetUserId: string) {
    const response = await axiosInstance.post(API_ROUTES.CONNECTIONS.FOLLOW, { targetUserId });
    return response.data;
  },
  async unfollowUser(targetUserId: string) {
    const response = await axiosInstance.post(API_ROUTES.CONNECTIONS.UNFOLLOW, { targetUserId });
    return response.data;
  },
  async blockUser(targetUserId: string) {
    const response = await axiosInstance.post(API_ROUTES.CONNECTIONS.BLOCK, { targetUserId });
    return response.data;
  },
  async unblockUser(targetUserId: string) {
    const response = await axiosInstance.post(API_ROUTES.CONNECTIONS.UNBLOCK, { targetUserId });
    return response.data;
  },
  async fetchFollowers(userId: string) {
    const response = await axiosInstance.get(API_ROUTES.CONNECTIONS.FETCH_FOLLOWERS(userId));
    return response.data;
  },
  async fetchFollowing(userId: string) {
    const response = await axiosInstance.get(API_ROUTES.CONNECTIONS.FETCH_FOLLOWING(userId));
    return response.data;
  },
};
