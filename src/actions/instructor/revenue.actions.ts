'use server'

import { createAction } from '@/actions/_shared/action-builder'
import { err, ok } from '@/core/shared/result'
import { instructorRepository } from '@/database/repositories/instructor.repository'

// ============ GET MY PURCHASES ============

export const getMyPurchases = createAction({
  name: 'instructor.getMyPurchases',
  requireAuth: true,
  allowedRoles: ['INSTRUCTOR'],
  execute: async (_, context) => {
    try {
      const purchases = await instructorRepository.getMyPurchases(context.userId)
      return ok(purchases || [])
    } catch (_error) {
      return err(new Error('Error al obtener compras'))
    }
  }
})

// ============ GET REVENUE STATS ============

export const getRevenueStats = createAction({
  name: 'instructor.getRevenueStats',
  requireAuth: true,
  allowedRoles: ['INSTRUCTOR'],
  execute: async (_, context) => {
    try {
      const stats = await instructorRepository.getRevenueStats(context.userId)
      return ok(stats)
    } catch (_error) {
      return err(new Error('Error al obtener estadísticas de ingresos'))
    }
  }
})
