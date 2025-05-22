import monogoose, { Schema } from 'mongoose';

const articleTagSchema = new Schema({  
    articleId: { type: String, required: true },
    tagId: { type: String, required: true }
}, {
    timestamps: true
});

articleTagSchema.index({ articleId: 1, tagId: 1 }, { unique: true });
export default monogoose.model('ArticleTag', articleTagSchema);