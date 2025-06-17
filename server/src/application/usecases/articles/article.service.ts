import { IArticleRepository } from "../../../domain/repositories/article.repository.interface";
import { ITagRepository } from "../../../domain/repositories/tag.repository.interface";
import { IArticleTagRepository } from "../../../domain/repositories/article-tag.repository.interface";
import { IUserRepository } from "../../../domain/repositories/user.repository.interface";
import { IReportRepository } from "../../../domain/repositories/report.repository.interface";
import { IArticleService } from "../../../domain/services/article.service.interface";
import {
  CreateArticleData,
  UpdateArticleData,
  GetArticlesParams,
  ArticlesResponse,
  ArticleResponse,
} from "../../dtos";

import { MissingFieldsError } from "../../errors/form.errors";
import { ResourceNotFoundError } from "../../errors/resource.errors";
import { HttpResponse } from "../../../config/responseMessages";

export class ArticleService implements IArticleService {
  constructor(
    private articleRepository: IArticleRepository,
    private tagRepository: ITagRepository,
    private articleTagRepository: IArticleTagRepository,
    private userRepository: IUserRepository,
    private reportRepository: IReportRepository
  ) {}

  async createArticle(
    article: CreateArticleData,
    tagIds: string[]
  ): Promise<ArticleResponse | string> {
    if (!article.authorId || !article.title || !article.content) {
      throw new MissingFieldsError();
    }

    const newArticle = await this.articleRepository.create(article);
    // Create article-tag relationships
    for (const tagId of tagIds) {
      const tag = await this.tagRepository.findById(tagId);
      if (tag) {
        await this.articleTagRepository.create({
          articleId: newArticle.id!,
          tagId,
        });
        await this.tagRepository.incrementUsageCount(tagId);
      }
    }
    return this.getArticleWithTags(newArticle.id!);
  }

  async getArticle(
    id: string,
    userId?: string
  ): Promise<ArticleResponse | null> {
    const article = await this.articleRepository.findById(id);
    if (!article) return null;

    const articleWithTags = await this.getArticleWithTags(id);

    if (userId) {
      const isReported = await this.reportRepository.existsByTarget({
        targetType: "article",
        targetId: id,
        reporterId: userId,
      });
      return { ...articleWithTags, isReported };
    }

    return articleWithTags;
  }

  async updateArticle(
    id: string,
    article: UpdateArticleData,
    tagIds?: string[]
  ): Promise<ArticleResponse | null> {
    const updatedArticle = await this.articleRepository.update(id, article);
    if (!updatedArticle) return null;

    if (tagIds) {
      // Remove existing tags
      const existingTags = await this.articleTagRepository.findByArticleId(id);
      for (const tag of existingTags) {
        await this.articleTagRepository.deleteByArticleAndTag(id, tag.tagId);
        await this.tagRepository.decrementUsageCount(tag.tagId);
      }

      // Add new tags
      for (const tagId of tagIds) {
        const tag = await this.tagRepository.findById(tagId);
        if (tag) {
          await this.articleTagRepository.create({ articleId: id, tagId });
          await this.tagRepository.incrementUsageCount(tagId);
        }
      }
    }

    return this.getArticleWithTags(id);
  }

  async deleteArticle(id: string): Promise<void> {
    // Remove all article-tag relationships
    const articleTags = await this.articleTagRepository.findByArticleId(id);
    for (const tag of articleTags) {
      await this.tagRepository.decrementUsageCount(tag.tagId);
    }
    await this.articleTagRepository.deleteByArticleId(id);

    // Delete the article
    await this.articleRepository.delete(id);
  }

  async getArticles(params: GetArticlesParams): Promise<ArticlesResponse> {
    const normalizedParams = {
      ...params,
      filters: params.filters
        ? {
            ...params.filters,
            tags: params.filters.tagIds || params.filters.tags,
            tagIds: undefined,
          }
        : undefined,
    };

    const result = await this.articleRepository.findAll(normalizedParams);

    const articlesWithTags = await Promise.all(
      result.data.map((article) => this.getArticleWithTags(article.id!))
    );

    //  sorting by  usage count
    if (params.sortBy === "tagUsageCount") {
      articlesWithTags.sort((a, b) => {
        const aTagCount = a.tags.length;
        const bTagCount = b.tags.length;
        return params.sortOrder === "desc"
          ? bTagCount - aTagCount
          : aTagCount - bTagCount;
      });
    }

    return { articles: articlesWithTags, total: result.total };
  }

  private async getArticleWithTags(
    articleId: string
  ): Promise<ArticleResponse> {
    const article = await this.articleRepository.findById(articleId);
    if (!article) throw new ResourceNotFoundError(HttpResponse.ARTICLE_NOT_FOUND);

    const articleTags = await this.articleTagRepository.findByArticleId(
      articleId
    );
    const tagIds = articleTags.map((at) => at.tagId);
    const tags = await Promise.all(
      tagIds.map((id) => this.tagRepository.findById(id))
    );
    const tagNames = tags
      .map((tag) => tag?.name)
      .filter((name): name is string => name !== null);

    // Get author information
    const author = await this.userRepository.findById(article.authorId);
    const authorName = author ? author.name : "Unknown Author";

    return {
      ...article,
      tags: tagIds,
      tagNames,
      author: authorName,
    };
  }

  async blockArticle(articleId: string): Promise<void> {
    const article = await this.articleRepository.findById(articleId);
    if (!article) {
      throw new ResourceNotFoundError(HttpResponse.ARTICLE_NOT_FOUND);
    }
    await this.articleRepository.update(articleId, { isActive: false });
  }
}
 