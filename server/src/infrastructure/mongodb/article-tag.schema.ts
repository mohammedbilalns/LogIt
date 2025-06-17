import mongoose, { Document, Schema } from "mongoose";
import { ArticleTag } from "../../domain/entities/article-tag.entity";

type ArticleTagWithoutId = Omit<ArticleTag, "id">;

export interface ArticleTagDocument extends Document, ArticleTagWithoutId {}

const articleTagSchema = new Schema<ArticleTagDocument>(
  {
    articleId: { type: String, required: true },
    tagId: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

articleTagSchema.index({ articleId: 1, tagId: 1 }, { unique: true });

const ArticleTagModel = mongoose.model<ArticleTagDocument>(
  "ArticleTag",
  articleTagSchema
);

export default ArticleTagModel;
