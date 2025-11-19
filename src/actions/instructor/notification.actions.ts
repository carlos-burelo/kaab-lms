"use server"

import { createAction } from "@/actions/_shared/action-builder"
import { instructorRepository } from "@/database/repositories/instructor.repository"
import { ok, err } from "@/core/shared/result"
import { z } from "zod"

// ============ GET NOTIFICATIONS ============

export const getNotifications = createAction({
  name: "instructor.getNotifications",
  requireAuth: true,
  schema: z
    .object({
      limit: z.number().optional()
    })
    .optional(),
  execute: async (input, context) => {
    try {
      const notifications = await instructorRepository.getNotifications(
        context.userId,
        input?.limit
      )
      return ok(notifications || [])
    } catch (_error) {
      return err(new Error("Error al obtener notificaciones"))
    }
  }
})

// ============ MARK NOTIFICATIONS AS READ ============

export const markNotificationsAsRead = createAction({
  name: "instructor.markNotificationsAsRead",
  requireAuth: true,
  schema: z
    .object({
      notificationIds: z.array(z.string()).optional()
    })
    .optional(),
  execute: async (input, context) => {
    try {
      await instructorRepository.markNotificationsAsRead(
        context.userId,
        input?.notificationIds
      )
      return ok({ success: true })
    } catch (_error) {
      return err(new Error("Error al marcar notificaciones"))
    }
  }
})

// ============ COUNT UNREAD NOTIFICATIONS ============

export const countUnreadNotifications = createAction({
  name: "instructor.countUnreadNotifications",
  requireAuth: true,
  execute: async (_, context) => {
    try {
      const count = await instructorRepository.countUnreadNotifications(
        context.userId
      )
      return ok(count)
    } catch (_error) {
      return err(new Error("Error al contar notificaciones"))
    }
  }
})
