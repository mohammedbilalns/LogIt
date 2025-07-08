import axiosInstance from '@/infrastructure/api/axios';
import { API_ROUTES } from '@/constants/routes';
import { HomeData } from '@/types/home.types';

export const homeServiceImpl = {
  async fetchHomeData(): Promise<HomeData> {
    const response = await axiosInstance.get(API_ROUTES.HOME.BASE);
    return response.data;
  },
}; 