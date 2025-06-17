import { Tag } from "../../domain/entities/tag.entity";

export interface GetTagsParams {
  page?: number;
  limit?: number;
  search?: string;
  promoted?: boolean;
  userId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateTagData {
  name: string;
  usageCount: number;
  promoted: boolean;
}

export interface UpdateTagData {
  name?: string;
  promoted?: boolean;
}

export interface TagsResponse {
  tags: Tag[];
  total: number;
}

export interface TagsByIdsResponse {
  tags: Tag[];
} 