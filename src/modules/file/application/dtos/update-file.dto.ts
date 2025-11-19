/**
 * Update File DTO
 */

import { z } from 'zod'

export const UpdateFileSchema = z.object({
  isPublic: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional()
})

export type UpdateFileDTO = z.infer<typeof UpdateFileSchema>
