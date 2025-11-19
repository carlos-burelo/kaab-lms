"use server"

import { createAction } from "@/actions/_shared/action-builder"
import { instructorRepository } from "@/database/repositories/instructor.repository"
import { ok, err } from "@/core/shared/result"
import { z } from "zod"

// ============ GET DISCUSSION THREADS ============

export const getDiscussionThreads = createAction({
  name: "instructor.getDiscussionThreads",
  requireAuth: true,
  allowedRoles: ["INSTRUCTOR"],
  execute: async (_, context) => {
    try {
      const threads = await instructorRepository.getDiscussionThreads(
        context.userId
      )
      return ok(threads || [])
    } catch (_error) {
      return err(new Error("Error al obtener threads"))
    }
  }
})

// ============ GET THREAD DETAIL ============

export const getThreadDetail = createAction({
  name: "instructor.getThreadDetail",
  requireAuth: true,
  schema: z.object({
    threadId: z.string()
  }),
  execute: async (input, _context) => {
    try {
      const thread = await instructorRepository.getThreadDetail(input.threadId)

      if (!thread) {
        return err(new Error("Thread no encontrado"))
      }

      return ok(thread)
    } catch (_error) {
      return err(new Error("Error al obtener thread"))
    }
  }
})

// ============ CREATE DISCUSSION POST ============

export const createDiscussionPost = createAction({
  name: "instructor.createDiscussionPost",
  requireAuth: true,
  schema: z.object({
    threadId: z.string(),
    content: z.string().min(1, "El contenido es requerido"),
    parentId: z.string().optional().nullable()
  }),
  execute: async (input, context) => {
    try {
      const post = await instructorRepository.createDiscussionPost({
        threadId: input.threadId,
        userId: context.userId,
        content: input.content,
        parentId: input.parentId
      })

      return ok(post)
    } catch (_error) {
      return err(new Error("Error al crear post"))
    }
  }
})

// ============ UPDATE DISCUSSION THREAD ============

export const updateDiscussionThread = createAction({
  name: "instructor.updateDiscussionThread",
  requireAuth: true,
  allowedRoles: ["INSTRUCTOR"],
  schema: z.object({
    threadId: z.string(),
    isClosed: z.boolean().optional(),
    isPinned: z.boolean().optional()
  }),
  execute: async (input, _context) => {
    try {
      const { threadId, ...data } = input
      const thread = await instructorRepository.updateDiscussionThread(
        threadId,
        data
      )

      return ok(thread)
    } catch (_error) {
      return err(new Error("Error al actualizar thread"))
    }
  }
})
