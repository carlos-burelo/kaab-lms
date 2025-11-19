/**
 * Create Quiz DTO
 */

import { z } from 'zod'

export const CreateQuizSchema = z.object({
  lessonId: z.string().min(1, 'Lesson ID is required'),
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  instructions: z.string().optional(),
  durationMinutes: z.number().positive().optional(),
  passingScore: z.number().min(0).max(100).default(60),
  maxAttempts: z.number().positive().optional(),
  showAnswers: z.boolean().default(true),
  shuffleQuestions: z.boolean().default(false)
})

export type CreateQuizDTO = z.infer<typeof CreateQuizSchema>
