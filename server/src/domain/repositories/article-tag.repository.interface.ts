import { ArticleTag } from "../entities/article-tag.entity";
import { IBaseRepository } from "./base.repository.interface";

export interface IArticleTagRepository extends IBaseRepository<ArticleTag> {
  findByArticleId(articleId: string): Promise<ArticleTag[]>;
  findByTagId(tagId: string): Promise<ArticleTag[]>;
  deleteByArticleAndTag(articleId: string, tagId: string): Promise<void>;
  deleteByArticleId(articleId: string): Promise<void>;
  deleteByTagId(tagId: string): Promise<void>;
}
