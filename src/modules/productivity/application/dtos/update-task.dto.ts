/**
 * Update Personal Task DTO
 */

import { z } from 'zod'
import { TaskPriority, TaskStatus } from '../../domain/value-objects'

export const UpdateTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters').optional(),
  description: z.string().max(2000, 'Description must be less than 2000 characters').optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  dueDate: z.coerce.date().optional().nullable()
})

export type UpdateTaskDTO = z.infer<typeof UpdateTaskSchema>
