export interface ArticleComment {
  id: string;
  articleId: string;
  userId: string;
  content: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  parentCommentId?: string;
  repliesCount?: number;
} 