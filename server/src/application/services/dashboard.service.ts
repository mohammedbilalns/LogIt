import { IDashboardService } from '../../domain/services/dashboard.service.interface';
import { DashboardStatsResponse, DashboardChartRequest, DashboardChartResponse } from '../dtos/dashboard.dto';
import { DashboardRepository } from '../../infrastructure/repositories/dashboard.repository';

export class DashboardService implements IDashboardService {
  constructor(private dashboardRepository: DashboardRepository) {}

  async getStats(): Promise<DashboardStatsResponse> {
    const [totalUsers, totalArticles, totalLogs] = await Promise.all([
      this.dashboardRepository.countUsers(),
      this.dashboardRepository.countArticles(),
      this.dashboardRepository.countLogs(),
    ]);
    return { totalUsers, totalArticles, totalLogs };
  }

  async getChartData(params: DashboardChartRequest): Promise<DashboardChartResponse> {
    const { type, granularity, startDate, endDate } = params;
    let data: { date: string; value: number }[] = [];
    if (type === 'user-joined') {
      data = await this.dashboardRepository.getUserJoinedChart(granularity, startDate ? new Date(startDate) : undefined, endDate ? new Date(endDate) : undefined);
    } else if (type === 'article-shared') {
      data = await this.dashboardRepository.getArticleSharedChart(granularity, startDate ? new Date(startDate) : undefined, endDate ? new Date(endDate) : undefined);
    }
    return { type, granularity, data };
  }
} 