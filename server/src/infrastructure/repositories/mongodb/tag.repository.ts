import mongoose, { Schema } from 'mongoose';
import { Tag } from '../../../domain/entities/tag.entity';
import { ITagRepository } from '../../../domain/repositories/tag.repository.interface';

const tagSchema = new Schema<Tag>({
  name: { type: String, required: true, unique: true },
  usageCount: { type: Number, default: 0 },
  promoted: { type: Boolean, default: false }
});

const TagModel = mongoose.model<Tag>('Tag', tagSchema);

export class MongoTagRepository implements ITagRepository {
  async create(tag: Omit<Tag, 'id'>): Promise<Tag> {
    const newTag = await TagModel.create(tag);
    return this.mapToTag(newTag);
  }

  async findById(id: string): Promise<Tag | null> {
    const tag = await TagModel.findById(id);
    return tag ? this.mapToTag(tag) : null;
  }

  async findByName(name: string): Promise<Tag | null> {
    const tag = await TagModel.findOne({ name });
    return tag ? this.mapToTag(tag) : null;
  }

  async update(id: string, tag: Partial<Tag>): Promise<Tag | null> {
    const updatedTag = await TagModel.findByIdAndUpdate(
      id,
      tag,
      { new: true }
    );
    return updatedTag ? this.mapToTag(updatedTag) : null;
  }

  async delete(id: string): Promise<void> {
    await TagModel.findByIdAndDelete(id);
  }

  async incrementUsageCount(id: string): Promise<void> {
    await TagModel.findByIdAndUpdate(id, { $inc: { usageCount: 1 } });
  }

  async decrementUsageCount(id: string): Promise<void> {
    await TagModel.findByIdAndUpdate(id, { $inc: { usageCount: -1 } });
  }

  async fetch(params: {
    page?: number;
    limit?: number;
    search?: string;
    promoted?: boolean;
  }): Promise<{ tags: Tag[]; total: number }> {
    const { page = 1, limit = 10, search = '', promoted } = params;
    
    const query: any = {};
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    if (promoted !== undefined) {
      query.promoted = promoted;
    }

    const skip = (page - 1) * limit;
    const [tagDocs, total] = await Promise.all([
      TagModel.find(query)
        .skip(skip)
        .limit(limit)
        .sort({ usageCount: -1 }),
      TagModel.countDocuments(query)
    ]);

    const tags = tagDocs.map(doc => this.mapToTag(doc));
    return { tags, total };
  }

  private mapToTag(doc: mongoose.Document): Tag {
    const tag = doc.toObject();
    return {
      ...tag,
      id: tag._id.toString(),
    };
  }
} 