/**
 * Update Calendar Event DTO
 */

import { z } from 'zod'
import { EventType } from '../../domain/value-objects'

export const UpdateEventSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters').optional(),
  description: z.string().max(2000, 'Description must be less than 2000 characters').optional(),
  type: z.nativeEnum(EventType).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  location: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  isAllDay: z.boolean().optional(),
  reminder: z.number().int().positive().optional().nullable()
})

export type UpdateEventDTO = z.infer<typeof UpdateEventSchema>
