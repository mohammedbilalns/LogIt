import { ArticleWithTags } from "../../domain/entities/article.entity";

export interface CreateArticleData {
  authorId: string;
  title: string;
  content: string;
  isActive: boolean;
  featured_image?: string | null;
  likes?: number;
}

export interface UpdateArticleData {
  title?: string;
  content?: string;
  featured_image?: string | null;
}

export interface GetArticlesParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  filters?: {
    authorId?: string;
    isActive?: boolean;
    tags?: string[];
    tagIds?: string[];
  };
}

export interface ArticlesResponse {
  articles: ArticleWithTags[];
  total: number;
}

export interface ArticleResponse extends ArticleWithTags {
  isReported?: boolean;
} 