import { Tag } from "../entities/tag.entity";
import { GetTagsParams, TagsResponse } from "../../application/dtos";

export interface ITagService {
  createTag(tag: Omit<Tag, "id">): Promise<Tag>;
  getTag(id: string): Promise<Tag | null>;
  getTags(params: GetTagsParams): Promise<TagsResponse>;
  getTagsByIds(ids: string[]): Promise<Tag[]>;
  updateTag(id: string, tag: Partial<Tag>): Promise<Tag | null>;
  deleteTag(id: string): Promise<void>;
  promoteTag(id: string): Promise<Tag | null>;
  demoteTag(id: string): Promise<Tag | null>;
} 