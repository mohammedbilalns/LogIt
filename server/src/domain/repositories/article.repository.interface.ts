import { Article } from "../entities/article.entity";
import { IBaseRepository } from "./base.repository.interface";

export interface ArticleFilters {
  authorId?: string;
  isActive?: boolean;
  tags?: string[];
  tagIds?: string[];
}

export interface ArticleFindAllParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  filters?: ArticleFilters;
}

export interface IArticleRepository extends IBaseRepository<Article> {
  findByAuthorId(authorId: string): Promise<Article[]>;
  findAll(
    params?: ArticleFindAllParams
  ): Promise<{ data: Article[]; total: number }>;
  addTag(articleId: string, tagId: string): Promise<void>;
  removeTag(articleId: string, tagId: string): Promise<void>;
}
