import { Report } from "../entities/report.entity";
import { IBaseRepository } from "./base.repository.interface";

interface FindReportsParams {
  page: number;
  limit: number;
  search?: string;
  status?: "pending" | "reviewed" | "resolved" | "blocked";
}

interface ReportsResult {
  reports: Report[];
  total: number;
}

export interface IReportRepository extends IBaseRepository<Report> {
  findByTarget(
    targetType: "article" | "user",
    targetId: string
  ): Promise<Report[]>;
  updateStatus(
    id: string,
    status: "pending" | "reviewed" | "resolved" | "blocked",
    actionTaken?: string | null
  ): Promise<Report | null>;
  existsByTarget(params: {
    targetType: "article" | "user";
    targetId: string;
    reporterId: string;
  }): Promise<boolean>;
  findReports(
    params: FindReportsParams
  ): Promise<ReportsResult>;
}
