import mongoose from "mongoose";
import { Article } from "../../domain/entities/article.entity";
import {
  IArticleRepository,
  ArticleFindAllParams,
} from "../../domain/repositories/article.repository.interface";
import ArticleModel, { ArticleDocument } from "../mongodb/article.shema";
import { BaseRepository } from "./base.repository";

export class MongoArticleRepository
  extends BaseRepository<ArticleDocument, Article>
  implements IArticleRepository
{
  constructor() {
    super(ArticleModel);
  }

  protected getSearchFields(): string[] {
    return ["title", "content"];
  }

  protected mapToEntity(doc: ArticleDocument): Article {
    const article = doc.toObject();
    return {
      ...article,
      id: article._id.toString(),
    };
  }

  async findByAuthorId(authorId: string): Promise<Article[]> {
    const articles = await ArticleModel.find({ authorId });
    return articles.map((article) => this.mapToEntity(article));
  }

  async findAll(
    params?: ArticleFindAllParams
  ): Promise<{ data: Article[]; total: number }> {
    const { filters = {}, ...restParams } = params || {};
    const query: Record<string, unknown> = { ...filters };

    if (query.isActive === undefined) {
      query.isActive = true;
    }

    const tagIds = filters.tagIds || filters.tags;
    let articleIds: string[] | undefined;

    if (tagIds && Array.isArray(tagIds) && tagIds.length > 0) {
      const articleTagModel = mongoose.model("ArticleTag");

      const tagObjectIds = tagIds.map((id) => new mongoose.Types.ObjectId(id));

      const articleTagIds = await articleTagModel.distinct("articleId", {
        tagId: { $in: tagObjectIds },
      });

      articleIds = articleTagIds.map((id) => id.toString());
    }

    delete query.tagIds;
    delete query.tags;

    if (articleIds) {
      query._id = {
        $in: articleIds.map((id) => new mongoose.Types.ObjectId(id)),
      };
    }

    const [data, total] = await Promise.all([
      this.model
        .find(query)
        .sort({
          [restParams.sortBy || "createdAt"]:
            restParams.sortOrder === "asc" ? 1 : -1,
        })
        .skip(((restParams.page || 1) - 1) * (restParams.limit || 10))
        .limit(restParams.limit || 10)
        .lean(),
      this.model.countDocuments(query),
    ]);

    return {
      data: data.map((doc) => ({
        id: doc._id?.toString() || "",
        authorId: doc.authorId || "",
        title: doc.title || "",
        content: doc.content || "",
        isActive: doc.isActive ?? true,
        featured_image: doc.featured_image,
        createdAt: doc.createdAt || new Date(),
        updatedAt: doc.updatedAt || new Date(),
      })),
      total,
    };
  }

  // stubs as tag management is handled by ArticleService
  async addTag(articleId: string, tagId: string): Promise<void> {
    void articleId;
    void tagId;
    return Promise.resolve();
  }

  async removeTag(articleId: string, tagId: string): Promise<void> {
    void articleId;
    void tagId;
    return Promise.resolve();
  }
}
