import { ReportRepository } from '../../../domain/repositories/report.repository.interface';
import { Report } from '../../../domain/entities/report.entity';
import { logger } from '../../../utils/logger';
import { ArticleService } from '../articles/article.service';
import { UserManagementService } from '../usermanagement/usermanagement.service';

interface CreateReportParams {
  reportedBy: string;  // This is the user ID
  targetType: 'article' | 'user';
  targetId: string;
  reason: string;
}

interface GetReportsParams {
  page: number;
  limit: number;
  search?: string;
  status?: 'pending' | 'reviewed' | 'resolved';
}

export class ReportService {
  private userManagementService: UserManagementService;

  constructor(
    private reportRepository: ReportRepository,
    private articleService: ArticleService
  ) {
    this.userManagementService = new UserManagementService();
  }

  async createReport(data: CreateReportParams): Promise<Report> {
    try {
      // Check if user has already reported this target
      const exists = await this.reportRepository.existsByTarget({
        targetType: data.targetType,
        targetId: data.targetId,
        reporterId: data.reportedBy
      });

      if (exists) {
        throw new Error('You have already reported this content');
      }

      // Verify that the reporter exists and get details
      const reporter = await this.userManagementService.getUserById(data.reportedBy);
      if (!reporter) {
        throw new Error('Reporter not found');
      }

      const reportData = {
        reportedBy: {
          id: reporter.id,
          name: reporter.name,
          email: reporter.email
        },
        targetType: data.targetType,
        targetId: data.targetId,
        reason: data.reason,
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

  async getReports({ page, limit, search, status }: GetReportsParams): Promise<{ reports: Report[]; totalPages: number }> {
    try {
      const skip = (page - 1) * limit;
      const { reports, total } = await this.reportRepository.findWithPagination({
        skip,
        limit,
        search,
        status
      });

      const totalPages = Math.ceil(total / limit);
      return { reports, totalPages };
    } catch (error) {
      logger.red('GET_REPORTS_ERROR', error instanceof Error ? error.message : 'Failed to get reports');
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

  async updateReportStatus(reportId: string, status: 'pending' | 'reviewed' | 'resolved'): Promise<Report | null> {
    try {
      const report = await this.reportRepository.findById(reportId);
      if (!report) {
        throw new Error('Report not found');
      }

      const updatedReport = await this.reportRepository.updateStatus(reportId, status);
      logger.green('REPORT_STATUS_UPDATED', `Report ${reportId} status updated to ${status}`);
      return updatedReport;
    } catch (error) {
      logger.red('UPDATE_REPORT_STATUS_ERROR', error instanceof Error ? error.message : 'Failed to update report status');
      throw error;
    }
  }

  async blockArticle(articleId: string): Promise<void> {
    try {
      // Update all reports for this article to blocked
      const reports = await this.reportRepository.findByTarget('article', articleId);
      await Promise.all(
        reports.map(report => {
          if (!report.id) {
            logger.yellow('BLOCK_ARTICLE_WARNING', `Report without ID found for article ${articleId}`);
            return Promise.resolve();
          }
          return this.reportRepository.updateStatus(report.id, 'blocked', 'Article blocked');
        })
      );

      // Block  article  by setting isActive to false
      await this.articleService.updateArticle(articleId, { isActive: false });
      logger.green('ARTICLE_BLOCKED', `Article ${articleId} blocked and related reports marked as blocked`);
    } catch (error) {
      logger.red('BLOCK_ARTICLE_ERROR', error instanceof Error ? error.message : 'Failed to block article');
      throw error;
    }
  }
} 