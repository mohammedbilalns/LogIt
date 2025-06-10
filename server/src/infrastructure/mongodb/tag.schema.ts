import mongoose, { Document } from 'mongoose';
import { Tag } from '../../domain/entities/tag.entity';

//  type that omits the id from Tag 
type TagWithoutId = Omit<Tag, 'id'>;

// Extend Document and add Tag properties without id
export interface TagDocument extends Document, TagWithoutId {}

const tagSchema = new mongoose.Schema<TagDocument>({ 
    name: {type: String, required: true, unique: true},
    usageCount: {type: Number, default: 0},
    promoted: {type: Boolean, default: false}
}, {
    timestamps: true
});

const TagModel = mongoose.model<TagDocument>("Tag", tagSchema);

export default TagModel;