'use server'

import { createAction } from '@/actions/_shared/action-builder'
import { err, ok } from '@/core/shared/result'
import { instructorRepository } from '@/database/repositories/instructor.repository'

// ============ GET DISCUSSION THREADS ============

/**
 * Obtiene todos los hilos de discusión en los cursos del instructor
 */
export const getDiscussionThreads = createAction({
  name: 'instructor.getDiscussionThreads',
  requireAuth: true,
  allowedRoles: ['INSTRUCTOR'],
  execute: async (_, context) => {
    try {
      const threads = await instructorRepository.getDiscussionThreads(context.userId)
      return ok(threads || [])
    } catch (_error) {
      return err(new Error('Error al obtener hilos de discusión'))
    }
  }
})
