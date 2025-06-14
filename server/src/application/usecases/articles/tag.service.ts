import { UnauthorizedError } from "../../errors/auth.errors";
import { Tag } from "../../../domain/entities/tag.entity";
import { ITagRepository } from "../../../domain/repositories/tag.repository.interface";

interface GetTagsParams {
  page?: number;
  limit?: number;
  search?: string;
  promoted?: boolean;
  userId?: string;
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
    const { userId, limit = 5, promoted } = params;

    if (promoted === true) {
      const promotedTags = await this.tagRepository.findAll({
        ...params,
        filters: { promoted: true },
        limit: limit,
      });
      return {
        tags: promotedTags.data,
        total: promotedTags.total,
      };
    }

    if (promoted === false) {
      const nonPromotedTags = await this.tagRepository.findAll({
        ...params,
        filters: { promoted: false },
        limit: limit,
      });
      return {
        tags: nonPromotedTags.data,
        total: nonPromotedTags.total,
      };
    }

    // get promoted tags
    const promotedTags = await this.tagRepository.findAll({
      ...params,
      filters: { promoted: true },
      limit: limit,
    });

    // If there is  enough promoted tags, return
    if (promotedTags.data.length >= limit) {
      return {
        tags: promotedTags.data.slice(0, limit),
        total: promotedTags.total,
      };
    }

    //get user's most used tags
    if (userId) {
      const userTags = await this.tagRepository.findUserMostUsedTags(userId, {
        limit: limit - promotedTags.data.length,
        excludeIds: promotedTags.data
          .map((tag) => tag.id)
          .filter((id): id is string => id !== undefined),
      });

      // Combine promoted and user tags
      return {
        tags: [...promotedTags.data, ...userTags.data],
        total: promotedTags.total + userTags.total,
      };
    }

    // get most used tags overall
    const mostUsedTags = await this.tagRepository.findMostUsedTags({
      limit: limit - promotedTags.data.length,
      excludeIds: promotedTags.data
        .map((tag) => tag.id)
        .filter((id): id is string => id !== undefined),
    });

    // Combine promoted and most used tags
    return {
      tags: [...promotedTags.data, ...mostUsedTags.data],
      total: promotedTags.total + mostUsedTags.total,
    };
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

  async getPromotedAndUserTags(
    userId: string | undefined,
    limit: number = 5
  ): Promise<{ tags: Tag[]; total: number }> {
    //  get promoted tags
    if (!userId) {
      throw new UnauthorizedError();
    }
    const promotedTags = await this.tagRepository.findAll({
      filters: { promoted: true },
      limit: limit,
    });

    if (promotedTags.data.length >= limit) {
      return {
        tags: promotedTags.data.slice(0, limit),
        total: promotedTags.total,
      };
    }

    const userTags = await this.tagRepository.findUserMostUsedTags(userId, {
      limit: limit - promotedTags.data.length,
      excludeIds: promotedTags.data
        .map((tag) => tag.id)
        .filter((id): id is string => id !== undefined),
    });

    return {
      tags: [...promotedTags.data, ...userTags.data],
      total: promotedTags.total + userTags.total,
    };
  }
}
