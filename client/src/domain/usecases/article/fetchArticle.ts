import { articleService } from '@/application/services/articleService';
import { Article } from '@/domain/entities/article';

export async function fetchArticle(id: string): Promise<Article> {
  return await articleService.fetchArticle(id);
} 