/**
 * Create Mission DTO
 */

import { z } from 'zod';
import {
  MissionType,
  MissionTypeValues,
  MissionDifficulty,
  MissionDifficultyValues,
} from '../../domain/value-objects';

export const CreateMissionSchema = z
  .object({
    title: z.string().min(3, 'Mission title must be at least 3 characters'),
    description: z
      .string()
      .min(10, 'Mission description must be at least 10 characters'),
    type: z.enum(MissionTypeValues as [string, ...string[]]).default(MissionType.DAILY),
    difficulty: z
      .enum(MissionDifficultyValues as [string, ...string[]])
      .default(MissionDifficulty.NORMAL),
    xpReward: z.number().min(0, 'XP reward cannot be negative').default(0),
    coinReward: z.number().min(0, 'Coin reward cannot be negative').default(0),
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

export type CreateMissionDTO = z.infer<typeof CreateMissionSchema>;
