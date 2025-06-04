export interface Report {
  id: string; // Use string for the ID in the domain layer
  reportedBy: string; // User ID (string)
  targetType: 'article' | 'user';
  targetId: string; // Article ID or User ID (string)
  reason: string;
  status: 'pending' | 'reviewed' | 'resolved';
  actionTaken: string | null;
  createdAt: Date;
} 