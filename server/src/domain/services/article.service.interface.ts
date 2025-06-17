import {
  CreateArticleData,
  UpdateArticleData,
  GetArticlesParams,
  ArticlesResponse,
  ArticleResponse,
} from "../../application/dtos";

export interface IArticleService {
  createArticle(
    article: CreateArticleData,
    tagIds: string[]
  ): Promise<ArticleResponse | string>;

  getArticle(
    id: string,
    userId?: string
  ): Promise<ArticleResponse | null>;

  updateArticle(
    id: string,
    article: UpdateArticleData,
    tagIds?: string[]
  ): Promise<ArticleResponse | null>;

  deleteArticle(id: string): Promise<void>;

  getArticles(params: GetArticlesParams): Promise<ArticlesResponse>;

  blockArticle(articleId: string): Promise<void>;
}
