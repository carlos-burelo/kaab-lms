/**
 * Submit Assignment DTO
 */

import { z } from 'zod'

export const SubmitAssignmentSchema = z.object({
  assignmentId: z.string().min(1, 'El ID de la asignación es requerido'),
  courseId: z.string().min(1, 'El ID del curso es requerido'),
  submissionText: z.string().optional(),
  fileIds: z.array(z.string()).optional().default([])
})

export type SubmitAssignmentDTO = z.infer<typeof SubmitAssignmentSchema>
