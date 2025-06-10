import { ArticleTag } from '../../domain/entities/article-tag.entity';
import { IArticleTagRepository } from '../../domain/repositories/article-tag.repository.interface';
import ArticleTagModel, {  ArticleTagDocument } from '../mongodb/article-tag.schema';
import { BaseRepository } from './base.repository';

export class MongoArticleTagRepository extends BaseRepository<ArticleTagDocument, ArticleTag> implements IArticleTagRepository {
  constructor() {
    super(ArticleTagModel);
  }

  protected getSearchFields(): string[] {
    return ['articleId', 'tagId'];
  }

  protected mapToEntity(doc: ArticleTagDocument): ArticleTag {
    const articleTag = doc.toObject();
    return {
      ...articleTag,
      id: articleTag._id.toString(),
    };
  }

  async findByArticleId(articleId: string): Promise<ArticleTag[]> {
    const articleTags = await ArticleTagModel.find({ articleId });
    return articleTags.map((at: ArticleTagDocument) => this.mapToEntity(at));
  }

  async findByTagId(tagId: string): Promise<ArticleTag[]> {
    const articleTags = await ArticleTagModel.find({ tagId });
    return articleTags.map((at: ArticleTagDocument) => this.mapToEntity(at));
  }

  async deleteByArticleAndTag(articleId: string, tagId: string): Promise<void> {
    await ArticleTagModel.deleteOne({ articleId, tagId });
  }

  async deleteByArticleId(articleId: string): Promise<void> {
    await ArticleTagModel.deleteMany({ articleId });
  }

  async deleteByTagId(tagId: string): Promise<void> {
    await ArticleTagModel.deleteMany({ tagId });
  }

  // Override base repository's delete method 
  async delete(id: string): Promise<boolean> {
    const result = await ArticleTagModel.deleteOne({ _id: id });
    return result.deletedCount > 0;
  }
} 