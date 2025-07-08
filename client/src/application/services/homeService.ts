import { homeServiceImpl } from '@/infrastructure/services/home.service';
import { HomeData } from '@/types/home.types';

export const homeService = {
  fetchHomeData: (): Promise<HomeData> => {
    return homeServiceImpl.fetchHomeData();
  },
}; 