import { ReportRepository } from "../../../domain/repositories/report.repository.interface";
import { Report } from "../../../domain/entities/report.entity";
import { logger } from "../../../utils/logger";
import { ArticleService } from "../articles/article.service";
import { UserManagementService } from "../usermanagement/usermanagement.service";
import { UnauthorizedError } from "../../errors/auth.errors";
import {
  InvalidFieldsError,
  MissingFieldsError,
} from "../../errors/form.errors";
import {
  ResourceConflictError,
  ResourceNotFoundError,
} from "../../errors/resource.errors";
import { HttpResponse } from "../../../config/responseMessages";
import { InternalServerError } from "../../errors/internal.errors";

interface CreateReportParams {
  reportedBy: string | undefined;
  targetType: "article" | "user" | undefined;
  targetId: string | undefined;
  reason: string | undefined;
}

interface GetReportsParams {
  page: number;
  limit: number;
  search?: string;
  status?: "pending" | "reviewed" | "resolved";
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
      if (!data.reportedBy) {
        throw new UnauthorizedError();
      }
      if (!data.targetId || !data.targetType || !data.reason) {
        throw new MissingFieldsError();
      }

      if (data.targetType !== "article" && data.targetType !== "user") {
        throw new InvalidFieldsError(HttpResponse.INVALID_BLOCK_TARGET);
      }

      // Check if user has already reported this target
      const exists = await this.reportRepository.existsByTarget({
        targetType: data.targetType,
        targetId: data.targetId,
        reporterId: data.reportedBy,
      });

      if (exists) {
        throw new ResourceConflictError(HttpResponse.REPORT_EXISTS);
      }

      // Verify that the reporter exists and get details
      const reporter = await this.userManagementService.getUserById(
        data.reportedBy
      );
      if (!reporter) {
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

      const report = await this.reportRepository.create(reportData);
      return report;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : HttpResponse.FAILED_TO_CREATE_REPORT;
      throw new InternalServerError(message);
    }
  }

  async getReports({
    page,
    limit,
    search,
    status,
  }: GetReportsParams): Promise<{ reports: Report[]; totalPages: number }> {
    try {
      const skip = (page - 1) * limit;
      const { reports, total } = await this.reportRepository.findWithPagination(
        {
          skip,
          limit,
          search,
          status,
        }
      );

      const totalPages = Math.ceil(total / limit);
      return { reports, totalPages };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : HttpResponse.FAILED_TO_FETCH_REPORTS;
      throw new InternalServerError(message);
    }
  }

  async getReportById(reportId: string): Promise<Report | null> {
    try {
      return this.reportRepository.findById(reportId);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : HttpResponse.FAILED_TO_FETCH_REPORTS;
      throw new InternalServerError(message);
    }
  }

  async getReportsByTarget(
    targetType: "article" | "user",
    targetId: string
  ): Promise<Report[]> {
    try {
      return this.reportRepository.findByTarget(targetType, targetId);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : HttpResponse.FAILED_TO_FETCH_REPORTS;
      throw new InternalServerError(message);
    }
  }

  async updateReportStatus(
    reportId: string,
    status: "pending" | "reviewed" | "resolved"
  ): Promise<Report | null> {
    try {
      const report = await this.reportRepository.findById(reportId);
      if (!report) {
        throw new ResourceNotFoundError(HttpResponse.REPORT_NOT_FOUND);
      }

      const updatedReport = await this.reportRepository.updateStatus(
        reportId,
        status
      );
      logger.green(
        "REPORT_STATUS_UPDATED",
        `Report ${reportId} status updated to ${status}`
      );
      return updatedReport;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : HttpResponse.FAILED_TO_UPDATE_REPORT_STATUS;
      throw new InternalServerError(message);
    }
  }

  async blockArticle(articleId: string): Promise<void> {
    try {
      // Update all reports for this article to blocked
      const reports = await this.reportRepository.findByTarget(
        "article",
        articleId
      );
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

      // Block  article  by setting isActive to false
      await this.articleService.updateArticle(articleId, { isActive: false });
   
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : HttpResponse.FAILED_TO_UPDATE_REPORT;
      throw new InternalServerError(message);
    }
  }
}
