import { IBaseRepository } from './base.repository.interface';
import { ArticleLike } from '../entities/article-like.entity';

export interface ArticleLikeRepositoryInterface extends IBaseRepository<ArticleLike> {
  findByArticleAndUser(articleId: string, userId: string): Promise<ArticleLike | null>;
  countLikes(articleId: string): Promise<number>;
} 