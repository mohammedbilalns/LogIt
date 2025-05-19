import mongoose, { Schema } from 'mongoose';
import { ArticleTag } from '../../../domain/entities/article-tag.entity';

const articleTagSchema = new Schema<ArticleTag>({
  articleId: { type: String, required: true },
  tagId: { type: String, required: true }
});

// Create a compound index to ensure uniqueness of article-tag pairs
articleTagSchema.index({ articleId: 1, tagId: 1 }, { unique: true });

const ArticleTagModel = mongoose.model<ArticleTag>('ArticleTag', articleTagSchema);

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