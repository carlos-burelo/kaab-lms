/**
 * Create Conversation DTO
 */

import { z } from 'zod'

export const CreateConversationSchema = z.object({
  participant2Id: z.string().min(1, 'Participant ID is required')
})

export type CreateConversationDTO = z.infer<typeof CreateConversationSchema>
