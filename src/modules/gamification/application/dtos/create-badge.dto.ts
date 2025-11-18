/**
 * Create Badge DTO
 */

import { z } from 'zod';
import { BadgeRarity, BadgeRarityValues } from '../../domain/value-objects';

export const CreateBadgeSchema = z.object({
  name: z.string().min(3, 'Badge name must be at least 3 characters'),
  description: z.string().min(10, 'Badge description must be at least 10 characters'),
  imageId: z.string().optional(),
  rarity: z.enum(BadgeRarityValues as [string, ...string[]]).default(BadgeRarity.COMMON),
  condition: z.record(z.any()).refine(
    (data) => Object.keys(data).length > 0,
    'Badge must have at least one condition'
  ),
});

export type CreateBadgeDTO = z.infer<typeof CreateBadgeSchema>;
