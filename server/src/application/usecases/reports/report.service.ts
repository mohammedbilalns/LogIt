import { IReportRepository } from "../../../domain/repositories/report.repository.interface";
import { Report } from "../../../domain/entities/report.entity";
import { IUserRepository } from "../../../domain/repositories/user.repository.interface";
import { IArticleRepository } from "../../../domain/repositories/article.repository.interface";
import { logger } from "../../../utils/logger";
import { UserManagementService } from "../usermanagement/usermanagement.service";
import { ResourceNotFoundError } from "../../errors/resource.errors";
import { HttpResponse } from "../../../config/responseMessages";
import { CreateReportDto, GetReportsDto, UpdateReportStatusDto } from "../../dtos";

export class ReportService {
  private userManagementService: UserManagementService;

  constructor(
    private reportRepository: IReportRepository,
    private articleRepository: IArticleRepository,
     userRepository: IUserRepository
  ) {
    this.userManagementService = new UserManagementService(userRepository);
  }

  async createReport(data: CreateReportDto): Promise<Report> {
    // Check if user has already reported this target
    const exists = await this.reportRepository.existsByTarget({
      targetType: data.targetType,
      targetId: data.targetId,
      reporterId: data.reportedBy,
    });

    if (exists) {
      throw new Error(HttpResponse.REPORT_EXISTS);
    }

    // Verify that the reporter exists and get details
    const reporter = await this.userManagementService.getUserById(data.reportedBy);
    if (!reporter || !reporter.id) {
      throw new ResourceNotFoundError(HttpResponse.REPORTER_NOT_FOUND);
    }

    const reportData = {
      reportedBy: {
        id: reporter.id,
        name: reporter.name,
        email: reporter.email,
      },
      targetType: data.targetType,
      targetId: data.targetId,
      reason: data.reason,
      status: "pending" as const,
      actionTaken: null,
    };

    return await this.reportRepository.create(reportData);
  }

  async getReports(params: GetReportsDto): Promise<{ reports: Report[]; totalPages: number }> {
    const skip = (params.page - 1) * params.limit;
    const { reports, total } = await this.reportRepository.findWithPagination({
      skip,
      limit: params.limit,
      search: params.search,
      status: params.status,
    });

    const totalPages = Math.ceil(total / params.limit);
    return { reports, totalPages };
  }

  async getReportById(reportId: string): Promise<Report | null> {
    return this.reportRepository.findById(reportId);
  }

  async getReportsByTarget(
    targetType: "article" | "user",
    targetId: string
  ): Promise<Report[]> {
    return this.reportRepository.findByTarget(targetType, targetId);
  }

  async updateReportStatus(params: UpdateReportStatusDto): Promise<Report | null> {
    const report = await this.reportRepository.findById(params.reportId);
    if (!report) {
      throw new ResourceNotFoundError(HttpResponse.REPORT_NOT_FOUND);
    }

    const updatedReport = await this.reportRepository.updateStatus(
      params.reportId,
      params.status
    );
    
    logger.green(
      "REPORT_STATUS_UPDATED",
      `Report ${params.reportId} status updated to ${params.status}`
    );
    
    return updatedReport;
  }

  async blockArticle(articleId: string): Promise<void> {
    const reports = await this.reportRepository.findByTarget("article", articleId);
    
    await Promise.all(
      reports.map((report) => {
        if (!report.id) {
          return Promise.resolve();
        }
        return this.reportRepository.updateStatus(
          report.id,
          "blocked",
          "Article blocked"
        );
      })
    );

    // Block article by setting isActive to false
    await this.articleRepository.update(articleId, { isActive: false });
  }
}
