/**
 * Update Achievement DTO
 */

import { z } from 'zod'
import { AchievementCategoryValues } from '../../domain/value-objects'

export const UpdateAchievementSchema = z.object({
  name: z.string().min(3, 'Achievement name must be at least 3 characters').optional(),
  description: z.string().min(10, 'Achievement description must be at least 10 characters').optional(),
  category: z.enum(AchievementCategoryValues as [string, ...string[]]).optional(),
  imageId: z.string().optional(),
  xpReward: z.number().min(0, 'XP reward cannot be negative').optional(),
  coinReward: z.number().min(0, 'Coin reward cannot be negative').optional(),
  maxProgress: z.number().min(1, 'Max progress must be at least 1').optional()
})

export type UpdateAchievementDTO = z.infer<typeof UpdateAchievementSchema>
