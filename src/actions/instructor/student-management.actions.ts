"use server"

import { createAction } from "@/actions/_shared/action-builder"
import { instructorRepository } from "@/database/repositories/instructor.repository"
import { ok, err } from "@/core/shared/result"

// ============ GET MY STUDENTS ============

/**
 * Obtiene todos los estudiantes inscritos en los cursos del instructor
 */
export const getMyStudents = createAction({
  name: "instructor.getMyStudents",
  requireAuth: true,
  allowedRoles: ["INSTRUCTOR"],
  execute: async (_, context) => {
    try {
      const students = await instructorRepository.getMyStudents(context.userId)
      return ok(students || [])
    } catch (_error) {
      return err(new Error("Error al obtener estudiantes"))
    }
  }
})
