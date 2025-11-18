"use server"

import { createAction } from "@/actions/_shared/action-builder"
import { instructorRepository } from "@/database/repositories/instructor.repository"
import { ok, err } from "@/core/shared/result"

// ============ GET MY PURCHASES ============

export const getMyPurchases = createAction({
  name: "instructor.getMyPurchases",
  requireAuth: true,
  allowedRoles: ["INSTRUCTOR"],
  execute: async (_, context) => {
    try {
      const purchases = await instructorRepository.getMyPurchases(
        context.userId
      )
      return ok(purchases || [])
    } catch (error) {
      return err(new Error("Error al obtener compras"))
    }
  }
})

// ============ GET REVENUE STATS ============

export const getRevenueStats = createAction({
  name: "instructor.getRevenueStats",
  requireAuth: true,
  allowedRoles: ["INSTRUCTOR"],
  execute: async (_, context) => {
    try {
      const stats = await instructorRepository.getRevenueStats(context.userId)
      return ok(stats)
    } catch (error) {
      return err(new Error("Error al obtener estadísticas de ingresos"))
    }
  }
})
