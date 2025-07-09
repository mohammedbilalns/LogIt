import mongoose, { Document, Schema } from 'mongoose';
import { ArticleLike } from '../../domain/entities/article-like.entity';

type ArticleLikeWithoutId = Omit<ArticleLike, 'id'>;
export interface ArticleLikeDocument extends Document, ArticleLikeWithoutId {}

const articleLikeSchema = new Schema({
  articleId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Article' } as any,
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' } as any,
  type: { type: String, enum: ['like', 'unlike'], required: true },
  createdAt: { type: Date, default: Date.now },
});

const ArticleLikeModel = mongoose.model<ArticleLikeDocument>('ArticleLike', articleLikeSchema);
export default ArticleLikeModel; 