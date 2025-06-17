import { Report } from "../entities/report.entity";
import { CreateReportDto, GetReportsDto, UpdateReportStatusDto } from "../../application/dtos";

export interface IReportService {
  createReport(data: CreateReportDto): Promise<Report>;
  getReports(params: GetReportsDto): Promise<{ reports: Report[]; totalPages: number }>;
  getReportById(reportId: string): Promise<Report | null>;
  getReportsByTarget(targetType: "article" | "user", targetId: string): Promise<Report[]>;
  updateReportStatus(params: UpdateReportStatusDto): Promise<Report | null>;
  blockArticle(articleId: string): Promise<void>;
}
