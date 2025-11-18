/**
 * Create Learning Path DTO
 */

import { z } from 'zod';

export const CreateLearningPathSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  createdBy: z.string().min(1, 'Creator ID is required'),
});

export type CreateLearningPathDTO = z.infer<typeof CreateLearningPathSchema>;
