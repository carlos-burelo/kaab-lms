/**
 * Update Course DTO
 */

import { z } from 'zod';

export const UpdateCourseSchema = z.object({
  courseId: z.string().min(1, 'Course ID is required'),
  title: z.string().min(3).max(200).optional(),
  description: z.string().max(5000).optional(),
  imageId: z.string().optional(),
  price: z.number().min(0).optional(),
  discountPrice: z.number().min(0).optional(),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']).optional(),
  categoryId: z.string().optional(),
  durationMinutes: z.number().min(0).optional(),
  requirements: z.array(z.string()).optional(),
  objectives: z.array(z.string()).optional(),
});

export type UpdateCourseDTO = z.infer<typeof UpdateCourseSchema>;
