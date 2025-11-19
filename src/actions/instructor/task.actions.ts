'use server'

import { createAction } from '@/actions/_shared/action-builder'
import { err, ok } from '@/core/shared/result'
import { instructorRepository } from '@/database/repositories/instructor.repository'

// ============ GET PERSONAL TASKS ============

/**
 * Obtiene todas las tareas personales del instructor
 */
export const getPersonalTasks = createAction({
  name: 'instructor.getPersonalTasks',
  requireAuth: true,
  allowedRoles: ['INSTRUCTOR'],
  execute: async (_, context) => {
    try {
      const tasks = await instructorRepository.getPersonalTasks(context.userId)
      return ok(tasks || [])
    } catch (_error) {
      return err(new Error('Error al obtener tareas personales'))
    }
  }
})
