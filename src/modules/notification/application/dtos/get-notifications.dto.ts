/**
 * Get Notifications DTO
 */

import { z } from 'zod';
import { NotificationTypeEnum } from '../../domain/value-objects/notification-type';

export const GetNotificationsSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  limit: z.number().positive().default(20),
  offset: z.number().min(0).default(0),
  isRead: z.boolean().optional(),
  type: z.nativeEnum(NotificationTypeEnum).optional(),
});

export type GetNotificationsDTO = z.infer<typeof GetNotificationsSchema>;
