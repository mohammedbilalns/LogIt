import mongoose, { Document, Schema } from 'mongoose';
import { ArticleComment } from '../../domain/entities/article-comment.entity';

type ArticleCommentWithoutId = Omit<ArticleComment, 'id'>;
export interface ArticleCommentDocument extends Document, ArticleCommentWithoutId {}

const articleCommentSchema = new Schema({
  articleId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Article' } as any,
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' } as any,
  content: { type: String, required: true },
  isDeleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  parentCommentId: { type: mongoose.Schema.Types.ObjectId, ref: 'ArticleComment', default: null } as any,
  repliesCount: { type: Number, default: 0 },
});

const ArticleCommentModel = mongoose.model<ArticleCommentDocument>('ArticleComment', articleCommentSchema);
export default ArticleCommentModel; 