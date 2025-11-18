/**
 * Update Mission DTO
 */

import { z } from 'zod';
import {
  MissionTypeValues,
  MissionDifficultyValues,
} from '../../domain/value-objects';

export const UpdateMissionSchema = z
  .object({
    title: z.string().min(3, 'Mission title must be at least 3 characters').optional(),
    description: z
      .string()
      .min(10, 'Mission description must be at least 10 characters')
      .optional(),
    type: z.enum(MissionTypeValues as [string, ...string[]]).optional(),
    difficulty: z
      .enum(MissionDifficultyValues as [string, ...string[]])
      .optional(),
    xpReward: z.number().min(0, 'XP reward cannot be negative').optional(),
    coinReward: z.number().min(0, 'Coin reward cannot be negative').optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return data.startDate < data.endDate;
      }
      return true;
    },
    {
      message: 'End date must be after start date',
      path: ['endDate'],
    }
  );

export type UpdateMissionDTO = z.infer<typeof UpdateMissionSchema>;
