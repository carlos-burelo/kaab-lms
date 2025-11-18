/**
 * Update Progress DTO
 */

import { z } from 'zod';

export const UpdateProgressSchema = z.object({
  enrollmentId: z.string().min(1, 'Enrollment ID is required'),
  completedLessons: z.number().min(0, 'Completed lessons must be non-negative'),
  totalLessons: z.number().positive('Total lessons must be positive'),
  lastLessonId: z.string().optional(),
  timeSpentMinutes: z.number().min(0).optional(),
});

export type UpdateProgressDTO = z.infer<typeof UpdateProgressSchema>;
