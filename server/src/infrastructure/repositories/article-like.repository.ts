import { BaseRepository } from './base.repository';
import { ArticleLikeRepositoryInterface } from '../../domain/repositories/article-like.repository.interface';
import ArticleLikeModel, { ArticleLikeDocument } from '../mongodb/article-like.schema';
import { ArticleLike } from '../../domain/entities/article-like.entity';

export class ArticleLikeRepository extends BaseRepository<ArticleLikeDocument, ArticleLike> implements ArticleLikeRepositoryInterface {
  constructor() {
    super(ArticleLikeModel);
  }

  protected getSearchFields(): string[] {
    return ['userId', 'articleId', 'type'];
  }

  protected mapToEntity(doc: ArticleLikeDocument): ArticleLike {
    return {
      id: String(doc._id),
      articleId: String(doc.articleId),
      userId: String(doc.userId),
      type: doc.type,
      createdAt: doc.createdAt,
    };
  }

  async findByArticleAndUser(articleId: string, userId: string): Promise<ArticleLike | null> {
    const doc = await ArticleLikeModel.findOne({ articleId, userId });
    return doc ? this.mapToEntity(doc as ArticleLikeDocument) : null;
  }

  async countLikes(articleId: string): Promise<number> {
    return ArticleLikeModel.countDocuments({ articleId, type: 'like' });
  }
} 