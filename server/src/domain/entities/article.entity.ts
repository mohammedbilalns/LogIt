import { BaseEntity } from "./base.entity";

export interface Article extends BaseEntity {
  authorId: string;
  title: string;
  isActive: boolean;
  content: string;
  featured_image?: string | null;
  likes: number;
}

export interface ArticleWithTags extends Article {
  tags: string[];
  tagNames: string[];
  author: string;
  isReported?: boolean;
} 