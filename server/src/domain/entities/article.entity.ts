export interface Article {
  id?: string;
  authorId: string;
  title: string;
  isActive: boolean;
  content: string;
  featured_image?: string;
  createdAt?: Date;
  updatedAt?: Date;
} 

export interface ArticleWithTags extends Article {
  tags: string[];
  tagNames: string[];
  author: string;
} 