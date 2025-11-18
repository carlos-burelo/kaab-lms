/**
 * Update Assignment DTO
 */

import { z } from 'zod';

export const UpdateAssignmentSchema = z.object({
  id: z.string().min(1, 'Assignment ID is required'),
  title: z.string().min(3, 'Title must be at least 3 characters').optional(),
  description: z.string().optional(),
  dueDate: z.coerce.date().optional(),
  maxScore: z.number().positive().optional(),
});

export type UpdateAssignmentDTO = z.infer<typeof UpdateAssignmentSchema>;
