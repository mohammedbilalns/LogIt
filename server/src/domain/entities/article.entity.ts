import { BaseEntity } from "./base.entity";

export interface Article extends BaseEntity {
  authorId: string;
  title: string;
  isActive: boolean;
  content: string;
  featured_image?: string;

} 

export interface ArticleWithTags extends Article {
  tags: string[];
  tagNames: string[];
  author: string;
  isReported?: boolean;
} 