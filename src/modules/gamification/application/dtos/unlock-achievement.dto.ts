/**
 * Unlock Achievement DTO
 */

import { z } from 'zod';

export const UnlockAchievementSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  achievementId: z.string().min(1, 'Achievement ID is required'),
});

export type UnlockAchievementDTO = z.infer<typeof UnlockAchievementSchema>;
