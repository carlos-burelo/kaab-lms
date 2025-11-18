"use server"

import { createAction } from "@/actions/_shared/action-builder"
import { instructorRepository } from "@/database/repositories/instructor.repository"
import { ok, err } from "@/core/shared/result"
import { z } from "zod"

// ============ GET INSTRUCTOR PROFILE ============

export const getInstructorProfile = createAction({
  name: "instructor.getProfile",
  requireAuth: true,
  allowedRoles: ["INSTRUCTOR"],
  execute: async (_, context) => {
    try {
      const profile = await instructorRepository.getProfile(context.userId)
      return ok(profile)
    } catch (error) {
      return err(new Error("Error al obtener perfil"))
    }
  }
})

// ============ UPDATE INSTRUCTOR PROFILE ============

export const updateInstructorProfile = createAction({
  name: "instructor.updateProfile",
  requireAuth: true,
  allowedRoles: ["INSTRUCTOR"],
  schema: z.object({
    publicBio: z.string().optional().nullable(),
    qualifications: z.any().optional(),
    payoutDetails: z.any().optional()
  }),
  execute: async (input, context) => {
    try {
      const profile = await instructorRepository.updateInstructorProfile(
        context.userId,
        {
          publicBio: input.publicBio,
          qualifications: input.qualifications,
          payoutDetails: input.payoutDetails
        }
      )

      return ok(profile)
    } catch (error) {
      return err(new Error("Error al actualizar perfil"))
    }
  }
})

// ============ GET INSTRUCTOR STATISTICS ============

export const getInstructorStatistics = createAction({
  name: "instructor.getStatistics",
  requireAuth: true,
  allowedRoles: ["INSTRUCTOR"],
  execute: async (_, context) => {
    try {
      const stats = await instructorRepository.getStatistics(context.userId)
      return ok(stats)
    } catch (error) {
      return err(new Error("Error al obtener estadísticas"))
    }
  }
})
