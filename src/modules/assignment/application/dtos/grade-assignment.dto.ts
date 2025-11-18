/**
 * Grade Assignment DTO
 */

import { z } from 'zod';

export const GradeAssignmentSchema = z.object({
  submissionId: z.string().min(1, 'Submission ID is required'),
  score: z.number().min(0, 'Score must be non-negative'),
  feedback: z.string().optional(),
});

export type GradeAssignmentDTO = z.infer<typeof GradeAssignmentSchema>;
