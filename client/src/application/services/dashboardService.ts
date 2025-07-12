import { API_ROUTES } from '@/constants/routes';
import api from '@/infrastructure/api/axios';
import {
  DashboardChartRequest,
  DashboardChartResponse,
  DashboardStatsResponse,
} from '@/types/dashboard.types';

export const dashboardService = {
  async fetchStats(): Promise<DashboardStatsResponse> {
    const response = await api.get(API_ROUTES.DASHBOARD.STATS);
    return response.data;
  },
  async fetchChartData(params: DashboardChartRequest): Promise<DashboardChartResponse> {
    const response = await api.post(API_ROUTES.DASHBOARD.CHART_DATA, params);
    return response.data;
  },
};
