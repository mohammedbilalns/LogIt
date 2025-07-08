import { articleService } from '@/application/services/articleService';
import { Article } from '@/domain/entities/article';

export interface ArticleLimitExceededResponse {
  limitExceeded: true;
  currentPlan: {
    id: string;
    name: string;
    price: number;
    maxLogsPerMonth: number;
    maxArticlesPerMonth: number;
    description: string;
  };
  nextPlans: Array<{
    id: string;
    name: string;
    isActive: boolean;
    description: string;
    price: number;
    maxLogsPerMonth: number;
    maxArticlesPerMonth: number;
  }>;
  currentUsage: number;
  limit: number;
  exceededResource: 'articles' | 'logs';
}

export type CreateArticleResult = Article | ArticleLimitExceededResponse;

export async function createArticle(title: string, content: string, tags: string[]): Promise<CreateArticleResult> {
  return await articleService.createArticle(title, content, tags);
} 