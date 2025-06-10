import { Article, ArticleWithTags } from '../../../domain/entities/article.entity';
import { IArticleRepository } from '../../../domain/repositories/article.repository.interface';
import { ITagRepository } from '../../../domain/repositories/tag.repository.interface';
import { IArticleTagRepository } from '../../../domain/repositories/article-tag.repository.interface';
import { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { ReportRepository } from '../../../domain/repositories/report.repository.interface';
import { logger } from '../../../utils/logger';

export class ArticleService {
  constructor(
    private articleRepository: IArticleRepository,
    private tagRepository: ITagRepository,
    private articleTagRepository: IArticleTagRepository,
    private userRepository: IUserRepository,
    private reportRepository: ReportRepository
  ) {}

  async createArticle(article: Omit<Article, 'id' | 'createdAt' | 'updatedAt'>, tagIds: string[]): Promise<ArticleWithTags> {
    const newArticle = await this.articleRepository.create(article);
    
    // Create article-tag relationships
    for (const tagId of tagIds) {
      const tag = await this.tagRepository.findById(tagId);
      if (tag) {
        await this.articleTagRepository.create({ articleId: newArticle.id!, tagId });
        await this.tagRepository.incrementUsageCount(tagId);
      }
    }

    return this.getArticleWithTags(newArticle.id!);
  }

  async getArticle(id: string, userId?: string): Promise<ArticleWithTags | null> {
    const article = await this.articleRepository.findById(id);
    if (!article) return null;
    
    const articleWithTags = await this.getArticleWithTags(id);
    
    console.log("User id ", userId)
    console.log("article id", id)
    // Check if the article is reported by the user
    if (userId) {
      const isReported = await this.reportRepository.existsByTarget({
        targetType: 'article',
        targetId: id,
        reporterId: userId
      });
      return { ...articleWithTags, isReported };
    }
    
    return articleWithTags;
  }

  async updateArticle(id: string, article: Partial<Article>, tagIds?: string[]): Promise<ArticleWithTags | null> {
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

  async getArticles(params: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    filters?: {
      authorId?: string;
      isActive?: boolean;
      tags?: string[];
      tagIds?: string[];
    };
  }): Promise<{ articles: ArticleWithTags[]; total: number }> {

   const normalizedParams = {
      ...params,
      filters: params.filters ? {
        ...params.filters,
        tags: params.filters.tagIds || params.filters.tags,
        tagIds: undefined
      } : undefined
    };

    const result = await this.articleRepository.findAll(normalizedParams);
  

    const articlesWithTags = await Promise.all(
      result.data.map(article => this.getArticleWithTags(article.id!))
    );


    //  sorting by tag usage count
    if (params.sortBy === 'tagUsageCount') {
      articlesWithTags.sort((a, b) => {
        const aTagCount = a.tags.length;
        const bTagCount = b.tags.length;
        return params.sortOrder === 'desc' ? bTagCount - aTagCount : aTagCount - bTagCount;
      });
    }

    return { articles: articlesWithTags, total: result.total };
  }

  private async getArticleWithTags(articleId: string): Promise<ArticleWithTags> {
    const article = await this.articleRepository.findById(articleId);
    if (!article) throw new Error('Article not found');

    const articleTags = await this.articleTagRepository.findByArticleId(articleId);
    const tagIds = articleTags.map(at => at.tagId);
    const tags = await Promise.all(tagIds.map(id => this.tagRepository.findById(id)));
    const tagNames = tags.map(tag => tag?.name).filter((name): name is string => name !== null);

    // Get author information
    const author = await this.userRepository.findById(article.authorId);
    const authorName = author ? author.name : 'Unknown Author';

    return {
      ...article,
      tags: tagIds,
      tagNames,
      author: authorName
    };
  }

  async blockArticle(articleId: string): Promise<void> {
    const article = await this.articleRepository.findById(articleId);
    if (!article) {
      throw new Error('Article not found');
    }
    await this.articleRepository.update(articleId, { isActive: false });
    logger.green('ARTICLE_BLOCKED', `Article ${articleId} has been blocked`);
  }
} 
