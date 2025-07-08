import {Article} from "./../entities/article"
import {Tag} from "./../entities/tag"

export interface ArticleService {
    fetchArticles: (page: number, limit: number) => Promise<Article[]>;
    fetchUserArticles: (page: number, limit: number) => Promise<Article[]>;
    fetchArticle: (id: string) => Promise<Article>;
    createArticle: (title: string, content: string, tags: Tag[]) => Promise<Article>;
    updateArticle: (id: string, title: string, content: string, tags: Tag[]) => Promise<Article>;
    deleteArticle: (id: string) => Promise<void>;
    reportArticle: (id: string, reason: string) => Promise<void>;
    unreportArticle: (id: string) => Promise<void>;
}