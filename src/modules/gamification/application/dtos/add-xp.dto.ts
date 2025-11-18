/**
 * Add XP DTO
 */

import { z } from 'zod';

export const AddXpSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  amount: z.number().positive('XP amount must be positive'),
  reason: z.string().min(1, 'Reason is required'),
});

export type AddXpDTO = z.infer<typeof AddXpSchema>;
