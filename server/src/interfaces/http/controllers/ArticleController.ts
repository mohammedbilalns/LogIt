import { Request, Response } from 'express';
import { ArticleService } from '../../../application/usecases/articles/article.service';

export class ArticleController {
  constructor(private articleService: ArticleService) {}

  async createArticle(req: Request, res: Response) {
    const { title, content, tagIds, featured_image } = req.body;
    const authorId = req.user?.id;
    
    if (!authorId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const article = await this.articleService.createArticle(
      { authorId, title, content, isActive: true, featured_image },
      tagIds || []
    );
    
    return res.status(201).json(article);
  }

  async updateArticle(req: Request, res: Response) {
    const { id } = req.params;
    const { title, content, tagIds, featured_image } = req.body;
    
    const article = await this.articleService.updateArticle(
      id, 
      { title, content, featured_image }, 
      tagIds
    );
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }
    
    return res.json(article);
  }

  async getArticle(req: Request, res: Response) {
    const { id } = req.params;
    const article = await this.articleService.getArticle(id);
    
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }
    
    return res.json(article);
  }

  async getArticles(req: Request, res: Response) {
    const { page, limit, search, sortBy, sortOrder, filters } = req.query;
    
    const articles = await this.articleService.getArticles({
      page: Number(page),
      limit: Number(limit),
      search: search as string,
      sortBy: sortBy as string,
      sortOrder: sortOrder as 'asc' | 'desc',
      filters: filters as any
    });
    
    return res.json(articles);
  }

  async deleteArticle(req: Request, res: Response) {
    const { id } = req.params;
    await this.articleService.deleteArticle(id);
    return res.status(204).send();
  }
} 