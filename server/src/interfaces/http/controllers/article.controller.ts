import { Request, Response } from "express";
import { ArticleService } from "../../../application/usecases/articles/article.service";
import { HttpStatus } from "../../../config/statusCodes";

export class ArticleController {
  constructor(private articleService: ArticleService) {}

  async createArticle(req: Request, res: Response) {
    const { title, content, tagIds, featured_image } = req.body;
    const authorId = req.user?.id || "";

    const article = await this.articleService.createArticle(
      { authorId, title, content, isActive: true, featured_image },
      tagIds || []
    );

    return res.status(HttpStatus.CREATED).json(article);
  }

  async updateArticle(req: Request, res: Response) {
    const { id: articleId } = req.params;
    const { title, content, tagIds, featured_image } = req.body;

    const article = await this.articleService.updateArticle(
      articleId,
      { title, content, featured_image },
      tagIds
    );

    return res.status(HttpStatus.OK).json(article);
  }

  async getArticle(req: Request, res: Response) {
    const { id: articleId } = req.params;
    const userId = req.user?.id;
    const article = await this.articleService.getArticle(articleId, userId);

    return res.status(HttpStatus.OK).json(article);
  }

  async getArticles(req: Request, res: Response) {
    const { page, limit, search, sortBy, sortOrder, filters } = req.query;

    let parsedFilters = {};
    if (filters) {
      parsedFilters = JSON.parse(filters as string);
    }

    const articles = await this.articleService.getArticles({
      page: Number(page),
      limit: Number(limit),
      search: search as string,
      sortBy: sortBy as string,
      sortOrder: sortOrder as "asc" | "desc",
      filters: parsedFilters,
    });

    return res.status(HttpStatus.OK).json(articles);
  }

  async deleteArticle(req: Request, res: Response) {
    const { id: articleId } = req.params;
    await this.articleService.deleteArticle(articleId);
    return res.status(HttpStatus.NO_CONTENT).send();
  }
}
