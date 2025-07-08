import { articleService } from '@/application/services/articleService';

export async function unreportArticle(id: string): Promise<void> {
  return await articleService.unreportArticle(id);
} 