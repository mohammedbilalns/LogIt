export interface Report {
  id: string;
  reportedBy: {
    id: string;
    name: string;
    email: string;
  };
  targetType: 'article' | 'user';
  targetId: string;
  reason: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'blocked';
  createdAt: string;
  targetArticleTitle?: string;
}
