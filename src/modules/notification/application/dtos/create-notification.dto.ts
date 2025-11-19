/**
 * Create Notification DTO
 */

import { z } from 'zod'
import { NotificationTypeEnum } from '../../domain/value-objects/notification-type'

export const CreateNotificationSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  type: z.nativeEnum(NotificationTypeEnum, {
    errorMap: () => ({
      message: `Type must be one of: ${Object.values(NotificationTypeEnum).join(', ')}`
    })
  }),
  title: z.string().min(3, 'Title must be at least 3 characters'),
  content: z.string().min(3, 'Content must be at least 3 characters'),
  link: z.string().url('Link must be a valid URL').optional(),
  data: z.record(z.unknown()).optional()
})

export type CreateNotificationDTO = z.infer<typeof CreateNotificationSchema>
