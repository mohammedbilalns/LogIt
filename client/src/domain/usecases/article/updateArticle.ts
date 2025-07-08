import { articleService } from '@/application/services/articleService';
import { Article } from '@/domain/entities/article';

export interface UpdateArticleData {
  title: string;
  content: string;
  tagIds: string[];
  featured_image?: string;
}

export async function updateArticle(id: string, data: UpdateArticleData): Promise<Article> {
  return await articleService.updateArticle(id, data);
} 