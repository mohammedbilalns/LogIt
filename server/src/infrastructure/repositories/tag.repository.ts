import { Tag } from '../../domain/entities/tag.entity';
import { ITagRepository } from '../../domain/repositories/tag.repository.interface';
import TagModel, { TagDocument } from '../mongodb/tag.schema';
import { BaseRepository } from './base.repository';
import mongoose, { Document } from 'mongoose';

export class MongoTagRepository extends BaseRepository<TagDocument, Tag> implements ITagRepository {
  constructor() {
    super(TagModel);
  }

  protected getSearchFields(): string[] {
    return ['name'];
  }

  protected mapToEntity(doc: TagDocument | { _id: mongoose.Types.ObjectId; name: string; usageCount: number; promoted: boolean }): Tag {
    const tag = doc instanceof Document ? doc.toObject() : doc;
    return {
      ...tag,
      id: tag._id.toString(),
    };
  }

  async findByName(name: string): Promise<Tag | null> {
    const tag = await TagModel.findOne({ name });
    return tag ? this.mapToEntity(tag) : null;
  }

  async incrementUsageCount(id: string): Promise<void> {
    await TagModel.findByIdAndUpdate(id, { $inc: { usageCount: 1 } });
  }

  async decrementUsageCount(id: string): Promise<void> {
    await TagModel.findByIdAndUpdate(id, { $inc: { usageCount: -1 } });
  }

  async findUserMostUsedTags(userId: string, params: { limit: number; excludeIds: string[] }): Promise<{ data: Tag[]; total: number }> {
    const { limit, excludeIds } = params;
    const query = {
      _id: { $nin: excludeIds },
      'usageCount.userId': userId
    };
    
    const [data, total] = await Promise.all([
      TagModel.find(query)
        .sort({ 'usageCount.count': -1 })
        .limit(limit),
      TagModel.countDocuments(query)
    ]);

    return {
      data: data.map(tag => this.mapToEntity(tag)),
      total
    };
  }

  async findMostUsedTags(params: { limit: number; excludeIds: string[] }): Promise<{ data: Tag[]; total: number }> {
    const { limit, excludeIds } = params;
    const query = {
      _id: { $nin: excludeIds }
    };
    
    const [data, total] = await Promise.all([
      TagModel.find(query)
        .sort({ usageCount: -1 })
        .limit(limit),
      TagModel.countDocuments(query)
    ]);

    return {
      data: data.map(tag => this.mapToEntity(tag)),
      total
    };
  }
} 