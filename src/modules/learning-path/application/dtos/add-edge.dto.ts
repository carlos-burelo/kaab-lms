/**
 * Add Edge DTO
 */

import { z } from 'zod';

export const AddEdgeSchema = z.object({
  learningPathId: z.string().min(1, 'Learning path ID is required'),
  sourceNodeId: z.string().min(1, 'Source node ID is required'),
  targetNodeId: z.string().min(1, 'Target node ID is required'),
  condition: z.record(z.unknown()).optional(),
});

export type AddEdgeDTO = z.infer<typeof AddEdgeSchema>;
