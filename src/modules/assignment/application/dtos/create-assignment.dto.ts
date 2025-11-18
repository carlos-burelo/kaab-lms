/**
 * Create Assignment DTO
 */

import { z } from 'zod';

export const CreateAssignmentSchema = z.object({
  lessonId: z.string().min(1, 'El ID de la lección es requerido'),
  courseId: z.string().min(1, 'El ID del curso es requerido'),
  title: z.string().min(1, 'El título es obligatorio').min(3, 'Mínimo 3 caracteres'),
  description: z.string().optional(),
  instructions: z.string().optional(),
  dueDate: z.coerce.date(),
  maxScore: z.number().positive('La puntuación máxima debe ser mayor a 0'),
  allowLateSubmission: z.boolean().default(false),
  latePenaltyPercent: z.number()
    .min(0, 'El porcentaje debe estar entre 0 y 100')
    .max(100, 'El porcentaje debe estar entre 0 y 100')
    .optional()
    .nullable(),
});

export type CreateAssignmentDTO = z.infer<typeof CreateAssignmentSchema>;
