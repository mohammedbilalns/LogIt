import { Article, ArticleWithTags } from '../../../domain/entities/article.entity';
import { IArticleRepository } from '../../../domain/repositories/article.repository.interface';
import { ITagRepository } from '../../../domain/repositories/tag.repository.interface';
import { MongoArticleTagRepository } from '../../../infrastructure/repositories/article-tag.repository';
import { IUserRepository } from '../../../domain/repositories/user.repository.interface';

export class ArticleService {
  constructor(
    private articleRepository: IArticleRepository,
    private tagRepository: ITagRepository,
    private articleTagRepository: MongoArticleTagRepository,
    private userRepository: IUserRepository
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

  async getArticle(id: string): Promise<ArticleWithTags | null> {
    const article = await this.articleRepository.findById(id);
    if (!article) return null;
    return this.getArticleWithTags(id);
  }

  async updateArticle(id: string, article: Partial<Article>, tagIds?: string[]): Promise<ArticleWithTags | null> {
    const updatedArticle = await this.articleRepository.update(id, article);
    if (!updatedArticle) return null;

    if (tagIds) {
      // Remove existing tags
      const existingTags = await this.articleTagRepository.findByArticleId(id);
      for (const tag of existingTags) {
        await this.articleTagRepository.delete(id, tag.tagId);
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
    };
  }): Promise<{ articles: ArticleWithTags[]; total: number }> {
    const { articles, total } = await this.articleRepository.fetch(params);
    const articlesWithTags = await Promise.all(
      articles.map(article => this.getArticleWithTags(article.id!))
    );

    // If sorting by tag usage count
    if (params.sortBy === 'tagUsageCount') {
      articlesWithTags.sort((a, b) => {
        const aTagCount = a.tags.length;
        const bTagCount = b.tags.length;
        return params.sortOrder === 'desc' ? bTagCount - aTagCount : aTagCount - bTagCount;
      });
    }

    return { articles: articlesWithTags, total };
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
} 