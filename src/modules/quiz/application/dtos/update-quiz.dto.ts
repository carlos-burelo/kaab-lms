/**
 * Update Quiz DTO
 */

import { z } from 'zod'

export const UpdateQuizSchema = z.object({
  id: z.string().min(1, 'Quiz ID is required'),
  title: z.string().min(3, 'Title must be at least 3 characters').optional(),
  description: z.string().optional(),
  instructions: z.string().optional(),
  durationMinutes: z.number().positive().optional(),
  passingScore: z.number().min(0).max(100).optional(),
  maxAttempts: z.number().positive().optional(),
  showAnswers: z.boolean().optional(),
  shuffleQuestions: z.boolean().optional()
})

export type UpdateQuizDTO = z.infer<typeof UpdateQuizSchema>
