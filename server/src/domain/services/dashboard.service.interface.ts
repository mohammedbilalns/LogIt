import { DashboardStatsResponse, DashboardChartRequest, DashboardChartResponse } from '../../application/dtos/dashboard.dto';

export interface IDashboardService {
  getStats(): Promise<DashboardStatsResponse>;
  getChartData(params: DashboardChartRequest): Promise<DashboardChartResponse>;
} 