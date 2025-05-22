import mongoose, {Schema} from "mongoose";
import { Article } from "src/domain/entities/article.entity";

const articleSchema = new Schema<Article>({
    authorId: {type: String, required: true},
    title: {type: String, required: true},
    isActive: {type: Boolean, default: true},
    content: {type: String, required: true},
    featured_image: {type: String},
    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now}
});

export default mongoose.model<Article>("Article", articleSchema);
