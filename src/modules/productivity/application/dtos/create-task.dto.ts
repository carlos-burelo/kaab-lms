/**
 * Create Personal Task DTO
 */

import { z } from 'zod'
import { TaskPriority } from '../../domain/value-objects'

export const CreateTaskSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().max(2000, 'Description must be less than 2000 characters').optional(),
  priority: z.nativeEnum(TaskPriority).default(TaskPriority.MEDIUM),
  dueDate: z.coerce.date().optional()
})

export type CreateTaskDTO = z.infer<typeof CreateTaskSchema>
