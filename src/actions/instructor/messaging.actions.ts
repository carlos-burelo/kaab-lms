"use server"

import { createAction } from "@/actions/_shared/action-builder"
import { instructorRepository } from "@/database/repositories/instructor.repository"
import { ok, err } from "@/core/shared/result"
import { z } from "zod"

// ============ GET CONVERSATIONS ============

export const getConversations = createAction({
  name: "instructor.getConversations",
  requireAuth: true,
  execute: async (_, context) => {
    try {
      const conversations = await instructorRepository.getConversations(
        context.userId
      )
      return ok(conversations || [])
    } catch (_error) {
      return err(new Error("Error al obtener conversaciones"))
    }
  }
})

// ============ GET CONVERSATION DETAIL ============

export const getConversationDetail = createAction({
  name: "instructor.getConversationDetail",
  requireAuth: true,
  schema: z.object({
    conversationId: z.string()
  }),
  execute: async (input, context) => {
    try {
      const conversation = await instructorRepository.getConversationDetail(
        input.conversationId,
        context.userId
      )

      if (!conversation) {
        return err(new Error("Conversación no encontrada"))
      }

      return ok(conversation)
    } catch (_error) {
      return err(new Error("Error al obtener conversación"))
    }
  }
})

// ============ SEND MESSAGE ============

export const sendMessage = createAction({
  name: "instructor.sendMessage",
  requireAuth: true,
  schema: z.object({
    conversationId: z.string(),
    content: z.string().min(1, "El mensaje no puede estar vacío"),
    fileId: z.string().optional().nullable()
  }),
  execute: async (input, context) => {
    try {
      const message = await instructorRepository.sendMessage({
        conversationId: input.conversationId,
        senderId: context.userId,
        content: input.content,
        fileId: input.fileId
      })

      return ok(message)
    } catch (_error) {
      return err(new Error("Error al enviar mensaje"))
    }
  }
})

// ============ GET OR CREATE CONVERSATION ============

export const getOrCreateConversation = createAction({
  name: "instructor.getOrCreateConversation",
  requireAuth: true,
  schema: z.object({
    receiverId: z.string()
  }),
  execute: async (input, context) => {
    try {
      const conversation = await instructorRepository.getOrCreateConversation(
        context.userId,
        input.receiverId
      )

      return ok(conversation)
    } catch (_error) {
      return err(new Error("Error al crear conversación"))
    }
  }
})
