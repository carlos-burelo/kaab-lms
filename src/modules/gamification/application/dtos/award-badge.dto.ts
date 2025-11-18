/**
 * Award Badge DTO
 */

import { z } from 'zod';

export const AwardBadgeSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  badgeId: z.string().min(1, 'Badge ID is required'),
});

export type AwardBadgeDTO = z.infer<typeof AwardBadgeSchema>;
