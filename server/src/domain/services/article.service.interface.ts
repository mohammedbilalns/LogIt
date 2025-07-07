import {
  CreateArticleData,
  UpdateArticleData,
  GetArticlesParams,
  ArticlesResponse,
  ArticleResponse,
} from "../../application/dtos";

export interface ResourceLimitResponse {
  limitExceeded: true;
  currentPlan: {
    id: string;
    name: string;
    price: number;
    maxLogsPerMonth: number;
    maxArticlesPerMonth: number;
    description: string;
  };
  nextPlan?: {
    id: string;
    name: string;
    price: number;
    maxLogsPerMonth: number;
    maxArticlesPerMonth: number;
    description: string;
  };
  currentUsage: number;
  limit: number;
  exceededResource: 'articles';
}

export interface IArticleService {
  
  createArticle(
    article: CreateArticleData,
    tagIds: string[]
  ): Promise<ArticleResponse | ResourceLimitResponse>;

  getArticle(id: string, userId?: string): Promise<ArticleResponse | null>;

  updateArticle(
    id: string,
    article: UpdateArticleData,
    tagIds?: string[]
  ): Promise<ArticleResponse | null>;

  deleteArticle(id: string): Promise<void>;

  getArticles(params: GetArticlesParams): Promise<ArticlesResponse>;

  blockArticle(articleId: string): Promise<void>;
}
