'use server'

import { createAction } from '@/actions/_shared/action-builder'
import { err, ok } from '@/core/shared/result'
import { instructorRepository } from '@/database/repositories/instructor.repository'

// ============ GET STATISTICS ============

/**
 * Obtiene estadísticas generales del instructor
 */
export const getStatistics = createAction({
  name: 'instructor.getStatistics',
  requireAuth: true,
  allowedRoles: ['INSTRUCTOR'],
  execute: async (_, context) => {
    try {
      const stats = await instructorRepository.getStatistics(context.userId)

      if (!stats) {
        return err(new Error('No se pudieron obtener las estadísticas'))
      }

      return ok(stats)
    } catch (_error) {
      return err(new Error('Error al obtener estadísticas'))
    }
  }
})
