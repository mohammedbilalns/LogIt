export interface ReportDocument {
  id?: string;
  reportedBy: string; // This is the ObjectId reference
  targetType: 'article' | 'user';
  targetId: string;
  reason: string;
  status: 'pending' | 'reviewed' | 'resolved';
  actionTaken?: string | null;
  createdAt: Date;
}

// Domain model
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

// Type for creating a new report
export type CreateReportData = Omit<ReportDocument, 'id' | 'createdAt'>;
