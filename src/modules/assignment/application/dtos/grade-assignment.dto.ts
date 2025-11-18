/**
 * Grade Assignment DTO
 */

import { z } from 'zod';

export const GradeAssignmentSchema = z.object({
  submissionId: z.string().min(1, 'El ID de la entrega es requerido'),
  courseId: z.string().min(1, 'El ID del curso es requerido'),
  score: z.number().min(0, 'La puntuación no puede ser negativa'),
  feedback: z.string().optional(),
  status: z.enum(['GRADED', 'NEEDS_REVISION']).default('GRADED'),
});

export type GradeAssignmentDTO = z.infer<typeof GradeAssignmentSchema>;
