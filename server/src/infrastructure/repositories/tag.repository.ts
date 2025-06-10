import { Tag } from '../../domain/entities/tag.entity';
import { ITagRepository } from '../../domain/repositories/tag.repository.interface';
import TagModel, { TagDocument } from '../mongodb/tag.schema';
import { BaseRepository } from './base.repository';

export class MongoTagRepository extends BaseRepository<TagDocument, Tag> implements ITagRepository {
  constructor() {
    super(TagModel);
  }

  protected getSearchFields(): string[] {
    return ['name'];
  }

  protected mapToEntity(doc: TagDocument): Tag {
    const tag = doc.toObject();
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

  async findAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
    promoted?: boolean;
  }): Promise<{ data: Tag[]; total: number }> {
    const { promoted, ...restParams } = params || {};
    const filters: Record<string, unknown> = {};
    
    if (promoted !== undefined) {
      filters.promoted = promoted;
    }

    const result = super.findAll({
      ...restParams,
      filters,
      sortBy: 'usageCount',
      sortOrder: 'desc'
    });
    console.log('Executing find all with params:', { ...restParams, filters, sortBy: 'usageCount', sortOrder: 'desc' });
    return result;
  }
} 