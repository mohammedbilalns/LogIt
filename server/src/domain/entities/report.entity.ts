export interface Report {
  id: string;
  reportedBy: string;
  targetType: "article" | "user";
  targetId: string;
  reason: string;
  status: "pending" | "reviewed" | "resolved";
  actionTaken: string | null;
  createdAt: Date;
}
