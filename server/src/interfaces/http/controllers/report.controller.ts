import { Request, Response } from 'express';
import { ReportService } from '../../../application/usecases/reports/report.service';
import { logger } from '../../../utils/logger';

export class ReportController {
  constructor(private reportService: ReportService) {}

  createReport = async (req: Request, res: Response): Promise<void> => {
    try {
      const { targetType, targetId, reason } = req.body;
      const reportedBy = req.user?.id; 

      if (!reportedBy) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
      }

      if (!targetType || !targetId || !reason) {
         res.status(400).json({ message: 'Missing required fields: targetType, targetId, reason' });
         return;
      }

      if (targetType !== 'article' && targetType !== 'user') {
         res.status(400).json({ message: "Invalid targetType. Must be 'article' or 'user'" });
         return;
      }

      const report = await this.reportService.createReport({
        reportedBy,
        targetType,
        targetId,
        reason,
      });

      res.status(201).json(report);
    } catch (error) {
      logger.red('CREATE_REPORT_CONTROLLER_ERROR', error instanceof Error ? error.message : 'Failed to create report via controller');
      res.status(500).json({ message: error instanceof Error ? error.message : 'Failed to create report' });
    }
  };

} 