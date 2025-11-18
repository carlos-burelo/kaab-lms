"use server"

import { createAction } from "@/actions/_shared/action-builder"
import { instructorRepository } from "@/database/repositories/instructor.repository"
import { ok, err } from "@/core/shared/result"

// ============ GET ANNOUNCEMENTS ============

/**
 * Obtiene todos los anuncios de los cursos del instructor
 */
export const getAnnouncements = createAction({
  name: "instructor.getAnnouncements",
  requireAuth: true,
  allowedRoles: ["INSTRUCTOR"],
  execute: async (_, context) => {
    try {
      const announcements = await instructorRepository.getAnnouncements(
        context.userId
      )
      return ok(announcements || [])
    } catch (error) {
      return err(new Error("Error al obtener anuncios"))
    }
  }
})
