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

  getReports = async (req: Request, res: Response): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;
      const status = req.query.status as string;

      const { reports, totalPages } = await this.reportService.getReports({
        page,
        limit,
        search,
        status: status === 'all' ? undefined : status as 'pending' | 'reviewed' | 'resolved',
      });
      console.log("Reports: ",  reports)

      res.json({ reports, totalPages });
    } catch (error) {
      logger.red('GET_REPORTS_CONTROLLER_ERROR', error instanceof Error ? error.message : 'Failed to get reports');
      res.status(500).json({ message: error instanceof Error ? error.message : 'Failed to get reports' });
    }
  };

  updateReportStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status || !['pending', 'reviewed', 'resolved'].includes(status)) {
        res.status(400).json({ message: 'Invalid status value' });
        return;
      }

      const updatedReport = await this.reportService.updateReportStatus(id, status as 'pending' | 'reviewed' | 'resolved');
      
      if (!updatedReport) {
        res.status(404).json({ message: 'Report not found' });
        return;
      }

      res.json(updatedReport);
    } catch (error) {
      logger.red('UPDATE_REPORT_STATUS_CONTROLLER_ERROR', error instanceof Error ? error.message : 'Failed to update report status');
      res.status(500).json({ message: error instanceof Error ? error.message : 'Failed to update report status' });
    }
  };

  blockArticle = async (req: Request, res: Response): Promise<void> => {
    try {
      const { articleId } = req.params;
      
      await this.reportService.blockArticle(articleId);
      
      res.json({ message: 'Article blocked successfully' });
    } catch (error) {
      logger.red('BLOCK_ARTICLE_CONTROLLER_ERROR', error instanceof Error ? error.message : 'Failed to block article');
      res.status(500).json({ message: error instanceof Error ? error.message : 'Failed to block article' });
    }
  };
} 