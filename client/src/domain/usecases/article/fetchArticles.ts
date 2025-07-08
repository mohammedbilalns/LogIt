import { articleService } from '@/application/services/articleService';
import { Article } from '@/domain/entities/article';

export async function fetchArticles(
  page: number,
  limit: number,
  filters?: string,
  sortBy?: string,
  sortOrder?: string
): Promise<{ articles: Article[]; total: number }> {
  return await articleService.fetchArticles(page, limit, filters, sortBy, sortOrder);
} 