export interface ReportDocument {
  id?: string;
  reportedBy: string;
  targetType: 'article' | 'user';
  targetId: string;
  reason: string;
  status: 'pending' | 'reviewed' | 'resolved';
  actionTaken?: string | null;
  createdAt: Date;
}

export interface Report {
  id?: string;
  reportedBy: {
    id: string;
    name: string;
    email: string;
  };
  targetType: 'article' | 'user';
  targetId: string;
  reason: string;
  status: 'pending' | 'reviewed' | 'resolved';
  actionTaken?: string | null;
  createdAt: Date;
}

export type CreateReportData = Omit<ReportDocument, 'id' | 'createdAt'>;
