"use server"

import { z } from "zod"
import { createAction } from "@/actions/_shared/action-builder"
import { studentRepository } from "@/database/repositories/student.repository"
import { ok, err } from "@/core/shared/result"

// ============ SCHEMAS ============

const getCalendarEventsSchema = z.object({
  startDate: z.string().or(z.date()).transform((val) =>
    typeof val === "string" ? new Date(val) : val
  ),
  endDate: z.string().or(z.date()).transform((val) =>
    typeof val === "string" ? new Date(val) : val
  )
})

// ============ GET CALENDAR EVENTS ============

/**
 * Obtiene eventos del calendario del estudiante en un rango de fechas
 */
export const getCalendarEvents = createAction({
  name: "student.getCalendarEvents",
  schema: getCalendarEventsSchema,
  requireAuth: true,
  allowedRoles: ["STUDENT"],
  execute: async (input, context) => {
    try {
      const events = await studentRepository.getCalendarEvents(
        context.userId,
        input.startDate,
        input.endDate
      )

      return ok(events || [])
    } catch (_error) {
      return err(new Error("Error al obtener eventos del calendario"))
    }
  }
})
