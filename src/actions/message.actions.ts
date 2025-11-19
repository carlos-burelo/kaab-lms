'use server'

import { revalidatePath } from 'next/cache'
import z from 'zod'
import { userRepository } from '@/database/repositories'
import { getSession } from '@/lib/auth'

// ============================================================================
// SCHEMAS - VALIDACIÓN
// ============================================================================

const SendMessageSchema = z.object({
  conversationId: z.string().min(1, 'El ID de la conversación es requerido'),
  message: z.string().min(1, 'El mensaje no puede estar vacío').max(5000, 'Máximo 5000 caracteres'),
  fileId: z.string().optional()
})

const GetConversationsSchema = z.object({
  limit: z.number().int().positive().default(50),
  skip: z.number().int().nonnegative().default(0)
})

// ============================================================================
// ENVIAR MENSAJE
// ============================================================================

export async function sendMessage(data: z.infer<typeof SendMessageSchema>) {
  try {
    const user = await getSession()
    if (!user?.id) {
      throw new Error('No autenticado')
    }

    const validated = SendMessageSchema.parse(data)

    const message = await userRepository.createMessage({
      conversationId: validated.conversationId,
      senderId: user.id,
      content: validated.message,
      fileId: validated.fileId
    })

    revalidatePath('/estudiante')
    revalidatePath('/instructor')
    return { success: true, data: message }
  } catch (_error) {
    const message = _error instanceof Error ? _error.message : 'Error al enviar mensaje'
    return { success: false, error: message }
  }
}

// ============================================================================
// OBTENER CONVERSACIONES
// ============================================================================

export async function getConversations(params?: z.infer<typeof GetConversationsSchema>) {
  try {
    const user = await getSession()
    if (!user?.id) {
      throw new Error('No autenticado')
    }

    const validated = GetConversationsSchema.parse(params || {})

    const conversations = await userRepository.getConversations(user.id, validated.limit, validated.skip)
    return { success: true, data: conversations }
  } catch (_error) {
    const message = _error instanceof Error ? _error.message : 'Error al obtener conversaciones'
    return { success: false, error: message }
  }
}

// ============================================================================
// OBTENER MENSAJES DE CONVERSACIÓN
// ============================================================================

export async function getConversationMessages(conversationId: string, limit: number = 50, skip: number = 0) {
  try {
    const user = await getSession()
    if (!user?.id) {
      throw new Error('No autenticado')
    }

    const conversation = await userRepository.getConversationById(conversationId)
    if (!conversation) {
      throw new Error('Conversación no encontrada')
    }

    // Verificar que el usuario es parte de la conversación
    if (conversation.initiatorId !== user.id && conversation.receiverId !== user.id) {
      throw new Error('No tienes permiso para ver esta conversación')
    }

    const messages = await userRepository.getConversationMessages(conversationId, limit, skip)

    // Marcar como leídos
    await userRepository.markConversationMessagesAsRead(conversationId, user.id)

    return { success: true, data: messages }
  } catch (_error) {
    const message = _error instanceof Error ? _error.message : 'Error al obtener mensajes'
    return { success: false, error: message }
  }
}

// ============================================================================
// OBTENER CONVERSACIÓN ESPECÍFICA O CREARLA
// ============================================================================

export async function getOrCreateConversation(participantId: string) {
  try {
    const user = await getSession()
    if (!user?.id) {
      throw new Error('No autenticado')
    }

    // Verificar que el participante existe
    const participant = await userRepository.getUserById(participantId)
    if (!participant) {
      throw new Error('Participante no encontrado')
    }

    // Buscar conversación existente
    let conversation = await userRepository.findConversation(user.id, participantId)

    // Si no existe, crearla
    if (!conversation) {
      const newConversation = await userRepository.createConversation(user.id, participantId)
      if (!newConversation) {
        throw new Error('Error al crear conversación')
      }
      conversation = newConversation
    }

    return { success: true, data: conversation }
  } catch (_error) {
    const message = _error instanceof Error ? _error.message : 'Error al obtener conversación'
    return { success: false, error: message }
  }
}

// ============================================================================
// MARCAR CONVERSACIÓN COMO LEÍDA
// ============================================================================

export async function markConversationAsRead(conversationId: string) {
  try {
    const user = await getSession()
    if (!user?.id) {
      throw new Error('No autenticado')
    }

    const conversation = await userRepository.getConversationById(conversationId)
    if (!conversation) {
      throw new Error('Conversación no encontrada')
    }

    // Verificar que el usuario es parte de la conversación
    if (conversation.initiatorId !== user.id && conversation.receiverId !== user.id) {
      throw new Error('No tienes permiso para marcar esta conversación')
    }

    await userRepository.markConversationMessagesAsRead(conversationId, user.id)

    return { success: true }
  } catch (_error) {
    const message = _error instanceof Error ? _error.message : 'Error al actualizar conversación'
    return { success: false, error: message }
  }
}

// ============================================================================
// ELIMINAR CONVERSACIÓN
// ============================================================================

export async function deleteConversation(conversationId: string) {
  try {
    const user = await getSession()
    if (!user?.id) {
      throw new Error('No autenticado')
    }

    const conversation = await userRepository.getConversationById(conversationId)
    if (!conversation) {
      throw new Error('Conversación no encontrada')
    }

    // Verificar que el usuario es parte de la conversación
    if (conversation.initiatorId !== user.id && conversation.receiverId !== user.id) {
      throw new Error('No tienes permiso para eliminar esta conversación')
    }

    await userRepository.deleteConversation(conversationId)

    revalidatePath('/estudiante')
    revalidatePath('/instructor')
    return { success: true }
  } catch (_error) {
    const message = _error instanceof Error ? _error.message : 'Error al eliminar conversación'
    return { success: false, error: message }
  }
}

// ============================================================================
// BUSCAR USUARIO PARA CONVERSAR
// ============================================================================

export async function searchUsersForChat(query: string, limit: number = 10) {
  try {
    const user = await getSession()
    if (!user?.id) {
      throw new Error('No autenticado')
    }

    const results = await userRepository.searchUsers(query, limit)

    // Filtrar al usuario actual
    const filtered = results.filter((u) => u.id !== user.id)

    return { success: true, data: filtered }
  } catch (_error) {
    const message = _error instanceof Error ? _error.message : 'Error al buscar usuarios'
    return { success: false, error: message }
  }
}
