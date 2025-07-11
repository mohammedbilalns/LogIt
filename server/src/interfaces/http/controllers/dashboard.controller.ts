import { Request, Response } from 'express';
import { IDashboardService } from '../../../domain/services/dashboard.service.interface';
import { DashboardChartRequest } from '../../../application/dtos/dashboard.dto';
import { HttpStatus } from '../../../constants/statusCodes';

export class DashboardController {
  private readonly dashboardService: IDashboardService;
  constructor(dashboardService: IDashboardService) {
    this.dashboardService = dashboardService;
  }


  async getStats(_req: Request, res: Response) {
    const stats = await this.dashboardService.getStats();
    return res.status(HttpStatus.OK).json(stats);
  }

  

  async getChartData(req: Request, res: Response) {
    const params: DashboardChartRequest = req.body;
    const data = await this.dashboardService.getChartData(params);
    return res.status(HttpStatus.OK).json(data);
  }
} 