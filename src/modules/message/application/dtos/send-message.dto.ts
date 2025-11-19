/**
 * Send Message DTO
 */

import { z } from 'zod'

export const SendMessageSchema = z.object({
  conversationId: z.string().min(1, 'Conversation ID is required'),
  content: z.string().min(1, 'Message content is required').max(10000, 'Message content must not exceed 10000 characters')
})

export type SendMessageDTO = z.infer<typeof SendMessageSchema>
