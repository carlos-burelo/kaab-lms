/**
 * Update Badge DTO
 */

import { z } from 'zod'
import { BadgeRarityValues } from '../../domain/value-objects'

export const UpdateBadgeSchema = z.object({
  name: z.string().min(3, 'Badge name must be at least 3 characters').optional(),
  description: z.string().min(10, 'Badge description must be at least 10 characters').optional(),
  imageId: z.string().optional(),
  rarity: z.enum(BadgeRarityValues as [string, ...string[]]).optional(),
  condition: z
    .record(z.any())
    .refine((data) => Object.keys(data).length > 0, 'Badge must have at least one condition')
    .optional()
})

export type UpdateBadgeDTO = z.infer<typeof UpdateBadgeSchema>
