import { z } from 'zod';

export const createLogSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(100, 'Title must not exceed 100 characters'),
  content: z.string()
    .min(1, 'Content is required')
    .max(5000, 'Content must not exceed 5000 characters'),
  tags: z.array(z.string())
    .max(10, 'Maximum 10 tags allowed')
    .optional(),
  mediaUrls: z.array(z.string().url('Invalid media URL'))
    .optional(),
  createdAt: z.string()
    .datetime('Invalid date format')
    .optional(),
});

export const updateLogSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(100, 'Title must not exceed 100 characters')
    .optional(),
  content: z.string()
    .min(1, 'Content is required')
    .max(5000, 'Content must not exceed 5000 characters')
    .optional(),
  tags: z.array(z.string())
    .max(10, 'Maximum 10 tags allowed')
    .optional(),
  mediaUrls: z.array(z.string().url('Invalid media URL'))
    .optional(),
  createdAt: z.string()
    .datetime('Invalid date format')
    .optional(),
}); 