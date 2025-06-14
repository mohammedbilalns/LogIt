import { Request, Response } from "express";
import { ReportService } from "../../../application/usecases/reports/report.service";

export class ReportController {
  constructor(private reportService: ReportService) {}

  createReport = async (req: Request, res: Response): Promise<void> => {
    const { targetType, targetId, reason } = req.body;
    const reportedBy = req.user?.id;

    const report = await this.reportService.createReport({
      reportedBy,
      targetType,
      targetId,
      reason,
    });

    res.json(report);
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

    res.json({ reports, totalPages });
  };

  updateReportStatus = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { status } = req.body;

    const updatedReport = await this.reportService.updateReportStatus(
      id,
      status as "pending" | "reviewed" | "resolved"
    );

    res.json(updatedReport);
  };

  blockArticle = async (req: Request, res: Response): Promise<void> => {
    const { articleId } = req.params;

    await this.reportService.blockArticle(articleId);

    const updatedReports = await this.reportService.getReportsByTarget(
      "article",
      articleId
    );

    res.json({
      message: "Article blocked successfully",
      reports: updatedReports,
    });
  };
}
