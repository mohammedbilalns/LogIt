import { z } from "zod";

export const createArticleSchema = z.object({
  title: z.string()
    .min(5, "Title must be at least 5 characters long")
    .max(200, "Title cannot exceed 200 characters"),
  content: z.string()
    .min(50, "Content must be at least 50 characters long")
    .max(50000, "Content cannot exceed 50000 characters"),
  tagIds: z.array(z.string())
    .max(10, "Cannot add more than 10 tags")
    .optional(),
  featured_image: z.string()
    .url("Featured image must be a valid URL")
    .optional(),
});

export const updateArticleSchema = z.object({
  title: z.string()
    .min(5, "Title must be at least 5 characters long")
    .max(200, "Title cannot exceed 200 characters")
    .optional(),
  content: z.string()
    .min(50, "Content must be at least 50 characters long")
    .max(50000, "Content cannot exceed 50000 characters")
    .optional(),
  tagIds: z.array(z.string())
    .min(1, "At least one tag is required")
    .max(10, "Cannot add more than 10 tags")
    .optional(),
  featured_image: z.string()
    .url("Featured image must be a valid URL")
    .optional(),
});

export const articleFiltersSchema = z.object({
  tags: z.array(z.string()).optional(),
  author: z.string().optional(),
  dateRange: z.object({
    start: z.string().datetime().optional(),
    end: z.string().datetime().optional(),
  }).optional(),
  isActive: z.boolean().optional(),
}).optional(); 