export interface ArticleLike {
  id: string;
  articleId: string;
  userId: string;
  type: 'like' | 'unlike';
  createdAt: Date;
} 