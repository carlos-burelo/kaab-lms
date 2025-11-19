/**
 * Update Learning Path DTO
 */

import { z } from 'zod'

export const UpdateLearningPathSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').optional(),
  description: z.string().optional()
})

export type UpdateLearningPathDTO = z.infer<typeof UpdateLearningPathSchema>
