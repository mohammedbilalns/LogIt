import { Request, Response } from "express";
import { IReportService } from "../../../domain/services/report.service.interface";
import { HttpStatus } from "../../../constants/statusCodes";
import { HttpResponse } from "../../../constants/responseMessages";

export class ReportController {
  constructor(private reportService: IReportService) {}

  createReport = async (req: Request, res: Response): Promise<void> => {
    const { targetType, targetId, reason } = req.body;
    const reportedBy = req.user?.id;

    if (!reportedBy) {
      res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ message: HttpResponse.AUTHENTICATION_REQUIRED });
      return;
    }

    const report = await this.reportService.createReport({
      reportedBy,
      targetType,
      targetId,
      reason,
    });

    res.status(HttpStatus.CREATED).json(report);
  };

  getReports = async (req: Request, res: Response): Promise<void> => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const status = req.query.status as string;

    const { reports, totalPages } = await this.reportService.getReports({
      page,
      limit,
      search,
      status:
        status === "all"
          ? undefined
          : (status as "pending" | "reviewed" | "resolved"),
    });

    res.status(HttpStatus.OK).json({ reports, totalPages });
  };

  updateReportStatus = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { status } = req.body;

    const updatedReport = await this.reportService.updateReportStatus({
      reportId: id,
      status: status as "pending" | "reviewed" | "resolved",
    });

    res.status(HttpStatus.OK).json(updatedReport);
  };

  blockArticle = async (req: Request, res: Response): Promise<void> => {
    const { articleId } = req.params;

    await this.reportService.blockArticle(articleId);

    const updatedReports = await this.reportService.getReportsByTarget(
      "article",
      articleId
    );

    res.status(HttpStatus.OK).json({
      message: HttpResponse.BLOCKED_ARTICLE,
      reports: updatedReports,
    });
  };
}
