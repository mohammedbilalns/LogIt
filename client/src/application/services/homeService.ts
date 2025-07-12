import { API_ROUTES } from '@/constants/routes';
import axiosInstance from '@/infrastructure/api/axios';

export const homeService = {
  async fetchHomeData() {
    const response = await axiosInstance.get(API_ROUTES.HOME.BASE);
    return response.data;
  },
};
