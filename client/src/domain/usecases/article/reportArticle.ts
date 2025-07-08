import { articleService } from '@/application/services/articleService';

export async function reportArticle(id: string, reason: string): Promise<void> {
  return await articleService.reportArticle(id, reason);
} 