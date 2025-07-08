import api from '@/infrastructure/api/axios';
import { Article } from '@/domain/entities/article';
import { API_ROUTES } from '@/constants/routes';

export const articleService = {
  async fetchArticles(
    page: number,
    limit: number,
    filters?: string
  ): Promise<{ articles: Article[]; total: number }> {
    const params: any = { page, limit };
    if (filters) params.filters = filters;
    const res = await api.get<{ articles: Article[]; total: number }>(API_ROUTES.ARTICLES.BASE, { params });
    return res.data;
  },
  async fetchUserArticles(userId: string, page: number, limit: number): Promise<{ articles: Article[]; total: number }> {
    const res = await api.get<{ articles: Article[]; total: number }>(`${API_ROUTES.ARTICLES.BASE}?page=${page}&limit=${limit}&authorId=${userId}`);
    return res.data;
  },
  async fetchArticle(id: string): Promise<Article> {
    const res = await api.get<Article>(API_ROUTES.ARTICLES.BY_ID(id));
    return res.data;
  },
  async createArticle(title: string, content: string, tags: string[]): Promise<Article> {
    const res = await api.post<Article>(API_ROUTES.ARTICLES.BASE, { title, content, tags });
    return res.data;
  },
  async updateArticle(id: string, data: { title: string; content: string; tagIds: string[]; featured_image?: string }): Promise<Article> {
    const res = await api.put<Article>(API_ROUTES.ARTICLES.BY_ID(id), data);
    return res.data;
  },
  async deleteArticle(id: string): Promise<void> {
    await api.delete(API_ROUTES.ARTICLES.BY_ID(id));
  },
  async reportArticle(id: string, reason: string): Promise<void> {
    await api.post(`${API_ROUTES.ARTICLES.BY_ID(id)}/report`, { reason });
  },
  async unreportArticle(id: string): Promise<void> {
    await api.delete(`${API_ROUTES.ARTICLES.BY_ID(id)}/report`);
  },
}; 