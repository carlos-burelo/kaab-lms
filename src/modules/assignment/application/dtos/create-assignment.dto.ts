/**
 * Create Assignment DTO
 */

import { z } from 'zod';

export const CreateAssignmentSchema = z.object({
  lessonId: z.string().min(1, 'Lesson ID is required'),
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  dueDate: z.coerce.date().optional(),
  maxScore: z.number().positive().default(100),
});

export type CreateAssignmentDTO = z.infer<typeof CreateAssignmentSchema>;
