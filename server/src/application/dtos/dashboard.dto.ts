// Dashboard analytics DTOs

export interface DashboardStatsResponse {
  totalUsers: number;
  totalArticles: number;
  totalLogs: number;
}

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