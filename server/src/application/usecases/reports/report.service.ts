import { ReportRepository } from '../../../domain/repositories/report.repository.interface';
import { Report } from '../../../domain/entities/report.entity';
import { logger } from '../../../utils/logger';

interface CreateReportData {
  reportedBy: string;
  targetType: 'article' | 'user';
  targetId: string;
  reason: string;
}

export class ReportService {
  constructor(private reportRepository: ReportRepository) {}

  async createReport(data: CreateReportData): Promise<Report> {
    try {
      //  default values for required fields
      const reportData = {
        ...data,
        status: 'pending' as const,
        actionTaken: null
      };

      const report = await this.reportRepository.create(reportData);
      logger.green('REPORT_CREATED', `Report for ${data.targetType} ${data.targetId} created by user ${data.reportedBy}`);
      return report;
    } catch (error) {
      logger.red('CREATE_REPORT_ERROR', error instanceof Error ? error.message : 'Failed to create report');
      throw error;
    }
  }

  async getReportById(reportId: string): Promise<Report | null> {
    try {
      return this.reportRepository.findById(reportId);
    } catch (error) {
       logger.red('GET_REPORT_ERROR', error instanceof Error ? error.message : 'Failed to get report');
       throw error;
    }
  }

  async getReportsByTarget(targetType: 'article' | 'user', targetId: string): Promise<Report[]> {
     try {
      return this.reportRepository.findByTarget(targetType, targetId);
    } catch (error) {
       logger.red('GET_REPORTS_BY_TARGET_ERROR', error instanceof Error ? error.message : 'Failed to get reports by target');
       throw error;
    }
  }

  async updateReportStatus(reportId: string, status: 'pending' | 'reviewed' | 'resolved', actionTaken?: string | null): Promise<Report | null> {
     try {
      return this.reportRepository.updateStatus(reportId, status, actionTaken);
    } catch (error) {
       logger.red('UPDATE_REPORT_STATUS_ERROR', error instanceof Error ? error.message : 'Failed to update report status');
       throw error;
    }
  }
} 