import { articleService } from '@/application/services/articleService';
import { Article } from '@/domain/entities/article';

export async function fetchUserArticles(userId: string, page: number, limit: number): Promise<{ articles: Article[]; total: number }> {
  return await articleService.fetchUserArticles(userId, page, limit);
} 