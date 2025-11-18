/**
 * Create Course DTO
 */

import { z } from 'zod';

export const CreateCourseSchema = z.object({
  instructorId: z.string().min(1, 'Instructor ID is required'),
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  description: z.string().optional(),
  imageId: z.string().optional(),
  price: z.number().min(0).optional(),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']).optional(),
  categoryId: z.string().optional(),
  requirements: z.array(z.string()).optional(),
  objectives: z.array(z.string()).optional(),
});

export type CreateCourseDTO = z.infer<typeof CreateCourseSchema>;
