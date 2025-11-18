/**
 * Submit Assignment DTO
 */

import { z } from 'zod';

export const SubmitAssignmentSchema = z.object({
  assignmentId: z.string().min(1, 'Assignment ID is required'),
  content: z.string().optional(),
  fileId: z.string().optional(),
}).refine(
  (data) => data.content || data.fileId,
  {
    message: 'Either content or fileId must be provided',
    path: ['content'],
  }
);

export type SubmitAssignmentDTO = z.infer<typeof SubmitAssignmentSchema>;
