import mongoose, {Schema} from "mongoose";
import { Tag } from "src/domain/entities/tag.entity";


const tagSchema = new Schema<Tag>({ 
    name: {type: String, required: true, unique: true},
    usageCount: {type: Number, default: 0},
    promoted: {type: Boolean, default: false}
});


export default mongoose.model<Tag>("Tag", tagSchema);