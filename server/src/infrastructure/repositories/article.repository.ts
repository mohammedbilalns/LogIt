import mongoose from 'mongoose';
import { Article } from '../../domain/entities/article.entity';
import { IArticleRepository } from '../../domain/repositories/article.repository.interface';
import ArticleModel from '../mongodb/article.shema';

export class MongoArticleRepository implements IArticleRepository {
  async create(article: Omit<Article, 'id' | 'createdAt' | 'updatedAt'>): Promise<Article> {
    const newArticle = await ArticleModel.create(article);
    return this.mapToArticle(newArticle);
  }

  async findById(id: string): Promise<Article | null> {
    const article = await ArticleModel.findById(id);
    return article ? this.mapToArticle(article) : null;
  }

  async findByAuthorId(authorId: string): Promise<Article[]> {
    const articles = await ArticleModel.find({ authorId });
    return articles.map(article => this.mapToArticle(article));
  }

  async update(id: string, article: Partial<Article>): Promise<Article | null> {
    const updatedArticle = await ArticleModel.findByIdAndUpdate(
      id,
      { ...article, updatedAt: new Date() },
      { new: true }
    );
    return updatedArticle ? this.mapToArticle(updatedArticle) : null;
  }

  async delete(id: string): Promise<void> {
    await ArticleModel.findByIdAndDelete(id);
  }

  async fetch(params: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    filters?: Record<string, any>;
  }): Promise<{ articles: Article[]; total: number }> {
    const { page = 1, limit = 10, search = '', sortBy = 'createdAt', sortOrder = 'desc', filters = {} } = params;
    
    const query: any = {};
    
    // Handle filters
    if (filters.authorId) {
      query.authorId = filters.authorId;
    }
    if (filters.isActive !== undefined) {
      query.isActive = filters.isActive;
    }
    
    // Handle search
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    // Handle tag filtering
    if (filters.tags && Array.isArray(filters.tags) && filters.tags.length > 0) {
      const articleTagModel = mongoose.model('ArticleTag');
      const articleIds = await articleTagModel.distinct('articleId', {
        tagId: { $in: filters.tags }
      });
      query._id = { $in: articleIds };
    }

    const skip = (page - 1) * limit;
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [articleDocs, total] = await Promise.all([
      ArticleModel.find(query)
        .skip(skip)
        .limit(limit)
        .sort(sort),
      ArticleModel.countDocuments(query)
    ]);

    const articles = articleDocs.map(doc => this.mapToArticle(doc));
    return { articles, total };
  }

  // @ts-ignore - These methods are stubs as tag management is handled by ArticleService
  async addTag(articleId: string, tagId: string): Promise<void> {
    return Promise.resolve();
  }

  // @ts-ignore - These methods are stubs as tag management is handled by ArticleService
  async removeTag(articleId: string, tagId: string): Promise<void> {
    return Promise.resolve();
  }

  private mapToArticle(doc: mongoose.Document): Article {
    const article = doc.toObject();
    return {
      ...article,
      id: article._id.toString(),
    };
  }
} 