import { reportService } from '@/application/services/reportService';

export async function blockArticle(articleId: string) {
  return await reportService.blockArticle(articleId);
} 