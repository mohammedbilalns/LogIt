import { z } from 'zod';

export const updateUserSchema = z.object({
  isBlocked: z.boolean({
    required_error: 'isBlocked status is required',
    invalid_type_error: 'isBlocked must be a boolean value',
  }),
}).strict(); 