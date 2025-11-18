/**
 * Add Coins DTO
 */

import { z } from 'zod';

export const AddCoinsSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  amount: z.number().positive('Coin amount must be positive'),
  reason: z.string().min(1, 'Reason is required'),
});

export type AddCoinsDTO = z.infer<typeof AddCoinsSchema>;
