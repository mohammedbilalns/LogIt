import { Article } from '../entities/article.entity';

export interface IArticleRepository {
  create(article: Omit<Article, 'id' | 'createdAt' | 'updatedAt'>): Promise<Article>;
  findById(id: string): Promise<Article | null>;
  findByAuthorId(authorId: string): Promise<Article[]>;
  update(id: string, article: Partial<Article>): Promise<Article | null>;
  delete(id: string): Promise<void>;
  fetch(params: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    filters?: {
        authorId?: string;
        isActive?: boolean;
        tags?: string[];
    }
  }): Promise<{ articles: Article[]; total: number }>;
  addTag(articleId: string, tagId: string): Promise<void>;
  removeTag(articleId: string, tagId: string): Promise<void>;
} 