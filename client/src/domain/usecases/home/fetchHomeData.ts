import { homeService } from '@/application/services/homeService';
import { HomeData } from '@/types/home.types';

export async function fetchHomeData(): Promise<HomeData> {
  return await homeService.fetchHomeData();
} 