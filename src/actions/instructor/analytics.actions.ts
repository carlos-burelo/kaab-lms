"use server"

import { createAction } from "@/actions/_shared/action-builder"
import { instructorRepository } from "@/database/repositories/instructor.repository"
import { ok, err } from "@/core/shared/result"

// ============ GET STATISTICS ============

/**
 * Obtiene estadísticas generales del instructor
 */
export const getStatistics = createAction({
  name: "instructor.getStatistics",
  requireAuth: true,
  allowedRoles: ["INSTRUCTOR"],
  execute: async (_, context) => {
    try {
      const stats = await instructorRepository.getStatistics(context.userId)

      if (!stats) {
        return err(new Error("No se pudieron obtener las estadísticas"))
      }

      return ok(stats)
    } catch (error) {
      return err(new Error("Error al obtener estadísticas"))
    }
  }
})
