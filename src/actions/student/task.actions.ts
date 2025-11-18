"use server"

import { createAction } from "@/actions/_shared/action-builder"
import { studentRepository } from "@/database/repositories/student.repository"
import { ok, err } from "@/core/shared/result"

// ============ GET PERSONAL TASKS ============

/**
 * Obtiene todas las tareas personales del estudiante
 */
export const getPersonalTasks = createAction({
  name: "student.getPersonalTasks",
  requireAuth: true,
  allowedRoles: ["STUDENT"],
  execute: async (_, context) => {
    try {
      const tasks = await studentRepository.getPersonalTasks(context.userId)
      return ok(tasks || [])
    } catch (error) {
      return err(new Error("Error al obtener tareas personales"))
    }
  }
})

// TODO: Agregar más actions para tareas cuando los use cases estén disponibles
// - createPersonalTask
// - updatePersonalTask
// - deletePersonalTask
// - toggleTaskCompletion
