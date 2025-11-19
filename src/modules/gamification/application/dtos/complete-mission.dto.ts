/**
 * Complete Mission DTO
 */

import { z } from 'zod'

export const CompleteMissionSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  missionId: z.string().min(1, 'Mission ID is required')
})

export type CompleteMissionDTO = z.infer<typeof CompleteMissionSchema>
