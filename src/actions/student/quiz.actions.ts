"use server"

import { createAction } from "@/actions/_shared/action-builder"
import { studentRepository } from "@/database/repositories/student.repository"
import { ok, err } from "@/core/shared/result"

// ============ GET QUIZ ATTEMPTS ============

/**
 * Obtiene todos los intentos de quiz del estudiante
 */
export const getQuizAttempts = createAction({
  name: "student.getQuizAttempts",
  requireAuth: true,
  allowedRoles: ["STUDENT"],
  execute: async (_, context) => {
    try {
      const attempts = await studentRepository.getQuizAttempts(context.userId)
      return ok(attempts || [])
    } catch (error) {
      return err(new Error("Error al obtener intentos de quiz"))
    }
  }
})

// TODO: Agregar más actions para quiz cuando los use cases estén disponibles
// - startQuizAttempt
// - submitQuizAnswer
// - completeQuizAttempt
