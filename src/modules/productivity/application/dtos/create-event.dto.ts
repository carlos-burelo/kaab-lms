/**
 * Create Calendar Event DTO
 */

import { z } from 'zod';
import { EventType } from '../../domain/value-objects';

export const CreateEventSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().max(2000, 'Description must be less than 2000 characters').optional(),
  type: z.nativeEnum(EventType).default(EventType.PERSONAL),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  location: z.string().optional(),
  color: z.string().optional(),
  isAllDay: z.boolean().default(false),
  reminder: z.number().int().positive().optional(),
});

export type CreateEventDTO = z.infer<typeof CreateEventSchema>;
