import mongoose from 'mongoose';
import { ArticleTag } from '../../domain/entities/article-tag.entity';
import ArticleTagModel from '../mongodb/article-tag.schema';


export class MongoArticleTagRepository {
  async create(articleTag: Omit<ArticleTag, 'id'>): Promise<ArticleTag> {
    const newArticleTag = await ArticleTagModel.create(articleTag);
    return this.mapToArticleTag(newArticleTag);
  }

  async findByArticleId(articleId: string): Promise<ArticleTag[]> {
    const articleTags = await ArticleTagModel.find({ articleId });
    return articleTags.map(at => this.mapToArticleTag(at));
  }

  async findByTagId(tagId: string): Promise<ArticleTag[]> {
    const articleTags = await ArticleTagModel.find({ tagId });
    return articleTags.map(at => this.mapToArticleTag(at));
  }

  async delete(articleId: string, tagId: string): Promise<void> {
    await ArticleTagModel.deleteOne({ articleId, tagId });
  }

  async deleteByArticleId(articleId: string): Promise<void> {
    await ArticleTagModel.deleteMany({ articleId });
  }

  async deleteByTagId(tagId: string): Promise<void> {
    await ArticleTagModel.deleteMany({ tagId });
  }

  private mapToArticleTag(doc: mongoose.Document): ArticleTag {
    const articleTag = doc.toObject();
    return {
      ...articleTag,
      id: articleTag._id.toString(),
    };
  }
} 