'use server'

import { createAction } from '@/actions/_shared/action-builder'
import { err, ok } from '@/core/shared/result'
import { instructorRepository } from '@/database/repositories/instructor.repository'

// ============ GET MY STUDENTS ============

/**
 * Obtiene todos los estudiantes inscritos en los cursos del instructor
 */
export const getMyStudents = createAction({
  name: 'instructor.getMyStudents',
  requireAuth: true,
  allowedRoles: ['INSTRUCTOR'],
  execute: async (_, context) => {
    try {
      const students = await instructorRepository.getMyStudents(context.userId)
      return ok(students || [])
    } catch (_error) {
      return err(new Error('Error al obtener estudiantes'))
    }
  }
})
