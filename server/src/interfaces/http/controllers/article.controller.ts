import { Request, Response } from 'express';
import { ArticleService } from '../../../application/usecases/articles/article.service';
import { logger } from '../../../utils/logger';

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
    
    console.log('Update article request:', {
      id,
      title,
      content: content?.substring(0, 100) + '...', 
      tagIds,
      featured_image
    });
    
    const article = await this.articleService.updateArticle(
      id, 
      { title, content, featured_image }, 
      tagIds
    );

    console.log('Update article response:', article ? 'Success' : 'Not found');
    
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }
    
    return res.json(article);
  }

  async getArticle(req: Request, res: Response) {
    const { id } = req.params;
    const userId = req.user?.id;
    const article = await this.articleService.getArticle(id, userId);
    
    console.log("Fetched Article", article)
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }
    
    return res.json(article);
  }

  async getArticles(req: Request, res: Response) {
    const { page, limit, search, sortBy, sortOrder, filters } = req.query;
    logger.cyan("GE_ARTICLE_FILTERS", JSON.stringify(filters));
    
    let parsedFilters = {};
    if (filters) {
        parsedFilters = JSON.parse(filters as string);
     
    }
    
    const articles = await this.articleService.getArticles({
      page: Number(page),
      limit: Number(limit),
      search: search as string,
      sortBy: sortBy as string,
      sortOrder: sortOrder as 'asc' | 'desc',
      filters: parsedFilters
    });
    
    return res.json(articles);
  }

  async deleteArticle(req: Request, res: Response) {
    const { id } = req.params;
    await this.articleService.deleteArticle(id);
    return res.status(204).send();
  }
} 