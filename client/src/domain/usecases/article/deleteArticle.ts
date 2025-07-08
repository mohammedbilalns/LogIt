import { articleService } from '@/application/services/articleService';

export async function deleteArticle(id: string): Promise<void> {
  return await articleService.deleteArticle(id);
} 