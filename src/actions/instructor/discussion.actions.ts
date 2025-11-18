"use server"

import { createAction } from "@/actions/_shared/action-builder"
import { instructorRepository } from "@/database/repositories/instructor.repository"
import { ok, err } from "@/core/shared/result"

// ============ GET DISCUSSION THREADS ============

/**
 * Obtiene todos los hilos de discusión en los cursos del instructor
 */
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
    } catch (error) {
      return err(new Error("Error al obtener hilos de discusión"))
    }
  }
})
