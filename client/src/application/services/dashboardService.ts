import api from '@/infrastructure/api/axios';
import { API_ROUTES } from '@/constants/routes';

export type DashboardStatsResponse = {
  totalUsers: number;
  totalArticles: number;
  totalLogs: number;
};

export type DashboardChartType = 'user-joined' | 'article-shared';
export type DashboardChartGranularity = 'daily' | 'monthly' | 'yearly';

export interface DashboardChartRequest {
  type: DashboardChartType;
  granularity: DashboardChartGranularity;
  startDate?: string;
  endDate?: string;
}

export interface DashboardChartDataPoint {
  date: string;
  value: number;
}

export interface DashboardChartResponse {
  type: DashboardChartType;
  granularity: DashboardChartGranularity;
  data: DashboardChartDataPoint[];
}

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