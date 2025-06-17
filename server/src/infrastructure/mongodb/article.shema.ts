import mongoose, { Document } from "mongoose";
import { Article } from "../../domain/entities/article.entity";

type ArticleWithoutId = Omit<Article, "id">;

export interface ArticleDocument extends Document, ArticleWithoutId {}

const articleSchema = new mongoose.Schema<ArticleDocument>(
  {
    authorId: { type: String, required: true },
    title: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    content: { type: String, required: true },
    featured_image: { type: String },
  },
  {
    timestamps: true,
  }
);

const ArticleModel = mongoose.model<ArticleDocument>("Article", articleSchema);

export default ArticleModel;
