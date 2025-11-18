"use server"

import { createAction } from "@/actions/_shared/action-builder"
import { instructorRepository } from "@/database/repositories/instructor.repository"
import { ok, err } from "@/core/shared/result"

// ============ GET PERSONAL TASKS ============

/**
 * Obtiene todas las tareas personales del instructor
 */
export const getPersonalTasks = createAction({
  name: "instructor.getPersonalTasks",
  requireAuth: true,
  allowedRoles: ["INSTRUCTOR"],
  execute: async (_, context) => {
    try {
      const tasks = await instructorRepository.getPersonalTasks(context.userId)
      return ok(tasks || [])
    } catch (error) {
      return err(new Error("Error al obtener tareas personales"))
    }
  }
})
