import { IBaseRepository } from './base.repository.interface';
import { ArticleComment } from '../entities/article-comment.entity';

export interface ArticleCommentRepositoryInterface extends IBaseRepository<ArticleComment> {
  findByArticle(articleId: string, page: number, limit: number): Promise<{comments: ArticleComment[], total: number}>;
  findReplies(parentCommentId: string): Promise<ArticleComment[]>;
  countReplies(parentCommentId: string): Promise<number>;
} 