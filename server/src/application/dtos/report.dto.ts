export interface CreateReportDto {
  reportedBy: string;
  targetType: "article" | "user";
  targetId: string;
  reason: string;
}

export interface GetReportsDto {
  page: number;
  limit: number;
  search?: string;
  status?: "pending" | "reviewed" | "resolved";
}

export interface UpdateReportStatusDto {
  reportId: string;
  status: "pending" | "reviewed" | "resolved";
} 