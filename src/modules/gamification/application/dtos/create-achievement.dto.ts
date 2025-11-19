/**
 * Create Achievement DTO
 */

import { z } from 'zod'
import { AchievementCategory, AchievementCategoryValues } from '../../domain/value-objects'

export const CreateAchievementSchema = z.object({
  name: z.string().min(3, 'Achievement name must be at least 3 characters'),
  description: z.string().min(10, 'Achievement description must be at least 10 characters'),
  category: z.enum(AchievementCategoryValues as [string, ...string[]]).default(AchievementCategory.LEARNING),
  imageId: z.string().optional(),
  xpReward: z.number().min(0, 'XP reward cannot be negative').default(0),
  coinReward: z.number().min(0, 'Coin reward cannot be negative').default(0),
  maxProgress: z.number().min(1, 'Max progress must be at least 1').default(1)
})

export type CreateAchievementDTO = z.infer<typeof CreateAchievementSchema>
