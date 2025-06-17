import { z } from 'zod';

export const createTagSchema = z.object({
  name: z.string()
    .trim()
    .min(2, 'Tag name must be at least 2 characters')
    .max(30, 'Tag name must not exceed 30 characters')
    .regex(/^[a-zA-Z0-9\s-]+$/, 'Tag name can only contain letters, numbers, spaces, and hyphens'),
});

