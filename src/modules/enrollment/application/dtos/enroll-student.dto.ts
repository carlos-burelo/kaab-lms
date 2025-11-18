/**
 * Enroll Student DTO
 */

import { z } from 'zod';

export const EnrollStudentSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  courseId: z.string().min(1, 'Course ID is required'),
});

export type EnrollStudentDTO = z.infer<typeof EnrollStudentSchema>;
