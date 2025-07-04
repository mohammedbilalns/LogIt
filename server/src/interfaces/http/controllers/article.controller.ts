import { Request, Response } from "express";
import { IArticleService } from "../../../domain/services/article.service.interface";
import {
  CreateArticleData,
  UpdateArticleData,
} from "../../../application/dtos";
import { HttpStatus } from "../../../constants/statusCodes";
import { ResourceLimitExceededError } from "../../../application/errors/resource.errors";

export class ArticleController {
  constructor(private articleService: IArticleService) {}

  async createArticle(req: Request, res: Response) {
    try {
      const { title, content, tagIds, featured_image } = req.body;
      const authorId = req.user?.id || "";

      const articleData: CreateArticleData = {
        authorId,
        title,
        content,
        isActive: true,
        featured_image,
      };

      const article = await this.articleService.createArticle(
        articleData,
        tagIds || []
      );

      return res.status(HttpStatus.CREATED).json(article);
    } catch (error) {
      if (error instanceof ResourceLimitExceededError) {
        return res.status(HttpStatus.FORBIDDEN).json({
          message: error.message,
          currentPlan: error.subscriptionData?.currentPlan,
          nextPlan: error.subscriptionData?.nextPlan,
          currentUsage: error.subscriptionData?.currentUsage,
          limit: error.subscriptionData?.limit,
          exceededResource: error.subscriptionData?.exceededResource
        });
      }
      throw error;
    }
  }

  async updateArticle(req: Request, res: Response) {
    const { id: articleId } = req.params;
    const { title, content, tagIds, featured_image } = req.body;

    const updateData: UpdateArticleData = {
      title,
      content,
      featured_image,
    };

    const article = await this.articleService.updateArticle(
      articleId,
      updateData,
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
