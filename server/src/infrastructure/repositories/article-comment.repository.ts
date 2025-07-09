import { BaseRepository } from './base.repository';
import { ArticleCommentRepositoryInterface } from '../../domain/repositories/article-comment.repository.interface';
import ArticleCommentModel, { ArticleCommentDocument } from '../mongodb/article-comment.schema';
import { ArticleComment } from '../../domain/entities/article-comment.entity';

export class ArticleCommentRepository extends BaseRepository<ArticleCommentDocument, ArticleComment> implements ArticleCommentRepositoryInterface {
  constructor() {
    super(ArticleCommentModel);
  }

  protected getSearchFields(): string[] {
    return ['userId', 'articleId', 'content'];
  }

  protected mapToEntity(doc: ArticleCommentDocument): ArticleComment {
    return {
      id: String(doc._id),
      articleId: String(doc.articleId),
      userId: String(doc.userId),
      content: doc.content,
      isDeleted: doc.isDeleted,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      parentCommentId: doc.parentCommentId ? String(doc.parentCommentId) : undefined,
      repliesCount: doc.repliesCount,
    };
  }

  async findByArticle(articleId: string, page: number, limit: number): Promise<{comments: ArticleComment[], total: number}> {
    const total = await ArticleCommentModel.countDocuments({ articleId, parentCommentId: null });
    const docs = await ArticleCommentModel.find({ articleId, parentCommentId: null })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    const comments = docs.map(doc => this.mapToEntity(doc as ArticleCommentDocument));
    return { comments, total };
  }

  async findReplies(parentCommentId: string): Promise<ArticleComment[]> {
    const docs = await ArticleCommentModel.find({ parentCommentId }).sort({ createdAt: 1 });
    return docs.map(doc => this.mapToEntity(doc as ArticleCommentDocument));
  }

  async countReplies(parentCommentId: string): Promise<number> {
    return ArticleCommentModel.countDocuments({ parentCommentId });
  }
} 