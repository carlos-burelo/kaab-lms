/**
 * Add Node DTO
 */

import { z } from 'zod'
import { NodeType } from '../../domain/value-objects/node-type'

export const AddNodeSchema = z.object({
  learningPathId: z.string().min(1, 'Learning path ID is required'),
  type: z.nativeEnum(NodeType, {
    errorMap: () => ({ message: 'Invalid node type' })
  }),
  courseId: z.string().optional(),
  position: z.object({
    x: z.number(),
    y: z.number()
  }),
  data: z.record(z.unknown()).optional()
})

export type AddNodeDTO = z.infer<typeof AddNodeSchema>
