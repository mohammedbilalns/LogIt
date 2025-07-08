import { ArticleService } from '@/domain/services/article.service';
import { Article } from '@/domain/entities/article';
import { Tag } from '@/domain/entities/tag';
import axiosInstance from '@/infrastructure/api/axios';

export class ArticleServiceImpl implements ArticleService {
  async fetchArticles(page: number, limit: number): Promise<Article[]> {
    const response = await axiosInstance.get(`/articles?page=${page}&limit=${limit}`);
    return response.data.articles;
  }

  async fetchUserArticles(page: number, limit: number): Promise<Article[]> {
    const response = await axiosInstance.get(`/articles/user?page=${page}&limit=${limit}`);
    return response.data.articles;
  }

  async fetchArticle(id: string): Promise<Article> {
    const response = await axiosInstance.get(`/articles/${id}`);
    return response.data.article;
  }

  async createArticle(title: string, content: string, tags: Tag[]): Promise<Article> {
    const response = await axiosInstance.post('/articles', { title, content, tags });
    return response.data.article;
  }

  async updateArticle(id: string, title: string, content: string, tags: Tag[]): Promise<Article> {
    const response = await axiosInstance.put(`/articles/${id}`, { title, content, tags });
    return response.data.article;
  }

  async deleteArticle(id: string): Promise<void> {
    await axiosInstance.delete(`/articles/${id}`);
  }

  async reportArticle(id: string, reason: string): Promise<void> {
    await axiosInstance.post(`/articles/${id}/report`, { reason });
  }

  async unreportArticle(id: string): Promise<void> {
    await axiosInstance.delete(`/articles/${id}/report`);
  }
}

// Export singleton instance
export const articleService = new ArticleServiceImpl(); 