import { Tag } from "../../../domain/entities/tag.entity";
import { ITagRepository } from "../../../domain/repositories/tag.repository.interface";

interface GetTagsParams {
  page?: number;
  limit?: number;
  search?: string;
  promoted?: boolean;
  userId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export class TagService {
  constructor(private tagRepository: ITagRepository) {}

  async createTag(tag: Omit<Tag, "id">): Promise<Tag> {
    return this.tagRepository.create(tag);
  }

  async getTag(id: string): Promise<Tag | null> {
    return this.tagRepository.findById(id);
  }

  async getTags(
    params: GetTagsParams
  ): Promise<{ tags: Tag[]; total: number }> {
    const { limit = 5, promoted, search } = params;

    if (search) {
      const searchFilters: Record<string, unknown> = {};
      
      if (promoted === true) {
        searchFilters.promoted = true;
      } else if (promoted === false) {
        searchFilters.promoted = false;
      }
      
      const searchResults = await this.tagRepository.findAll({
        page: params.page,
        limit: limit || 10, 
        search: search,
        sortBy: params.sortBy,
        sortOrder: params.sortOrder,
        filters: Object.keys(searchFilters).length > 0 ? searchFilters : undefined,
      });
      return {
        tags: searchResults.data,
        total: searchResults.total,
      };
    }

    if (promoted === true) {
      const promotedTags = await this.tagRepository.findAll({
        page: params.page,
        limit: limit,
        search: params.search,
        sortBy: params.sortBy,
        sortOrder: params.sortOrder,
        filters: { promoted: true },
      });
      return {
        tags: promotedTags.data,
        total: promotedTags.total,
      };
    }

    if (promoted === false) {
      const nonPromotedTags = await this.tagRepository.findAll({
        page: params.page,
        limit: limit,
        search: params.search,
        sortBy: params.sortBy,
        sortOrder: params.sortOrder,
        filters: { promoted: false },
      });
      return {
        tags: nonPromotedTags.data,
        total: nonPromotedTags.total,
      };
    }

    const promotedTags = await this.tagRepository.findAll({
      page: params.page,
      limit: limit,
      search: params.search,
      sortBy: params.sortBy,
      sortOrder: params.sortOrder,
      filters: { promoted: true },
    });

    return {
      tags: promotedTags.data,
      total: promotedTags.total,
    };
  }

  async getTagsByIds(ids: string[]): Promise<Tag[]> {
    const tags = await Promise.all(
      ids.map(id => this.tagRepository.findById(id))
    );
    return tags.filter((tag): tag is Tag => tag !== null);
  }

  async updateTag(id: string, tag: Partial<Tag>): Promise<Tag | null> {
    return this.tagRepository.update(id, tag);
  }

  async deleteTag(id: string): Promise<void> {
    await this.tagRepository.delete(id);
  }

  async promoteTag(id: string): Promise<Tag | null> {
    return this.tagRepository.update(id, { promoted: true });
  }

  async demoteTag(id: string): Promise<Tag | null> {
    return this.tagRepository.update(id, { promoted: false });
  }
}
