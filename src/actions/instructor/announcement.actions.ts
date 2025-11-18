"use server"

import { createAction } from "@/actions/_shared/action-builder"
import { instructorRepository } from "@/database/repositories/instructor.repository"
import { ok, err } from "@/core/shared/result"
import { z } from "zod"

// ============ GET ANNOUNCEMENTS ============

/**
 * Obtiene todos los anuncios de los cursos del instructor
 */
export const getAnnouncements = createAction({
  name: "instructor.getAnnouncements",
  requireAuth: true,
  allowedRoles: ["INSTRUCTOR"],
  execute: async (_, context) => {
    try {
      const announcements = await instructorRepository.getAnnouncements(
        context.userId
      )
      return ok(announcements || [])
    } catch (error) {
      return err(new Error("Error al obtener anuncios"))
    }
  }
})

// ============ GET ANNOUNCEMENT BY ID ============

export const getAnnouncementById = createAction({
  name: "instructor.getAnnouncementById",
  requireAuth: true,
  allowedRoles: ["INSTRUCTOR"],
  schema: z.object({
    announcementId: z.string()
  }),
  execute: async (input, _context) => {
    try {
      const announcement = await instructorRepository.getAnnouncementById(
        input.announcementId
      )

      if (!announcement) {
        return err(new Error("Anuncio no encontrado"))
      }

      return ok(announcement)
    } catch (error) {
      return err(new Error("Error al obtener anuncio"))
    }
  }
})

// ============ CREATE ANNOUNCEMENT ============

const createAnnouncementSchema = z.object({
  title: z.string().min(1, "El título es requerido"),
  content: z.string().min(1, "El contenido es requerido"),
  ctaLink: z.string().optional().nullable(),
  ctaText: z.string().optional().nullable(),
  imageId: z.string().optional().nullable(),
  placement: z.enum([
    "DASHBOARD_BANNER",
    "COURSE_BANNER",
    "GLOBAL_MODAL",
    "INLINE_FEED",
    "LOGIN_PAGE"
  ]),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  priority: z.number().default(0),
  targetRole: z.enum(["STUDENT", "INSTRUCTOR", "ADMIN"]).optional().nullable(),
  targetCourseId: z.string().optional().nullable()
})

export const createAnnouncement = createAction({
  name: "instructor.createAnnouncement",
  requireAuth: true,
  allowedRoles: ["INSTRUCTOR", "ADMIN"],
  schema: createAnnouncementSchema,
  execute: async (input, _context) => {
    try {
      const announcement = await instructorRepository.createAnnouncement({
        title: input.title,
        content: input.content,
        ctaLink: input.ctaLink,
        ctaText: input.ctaText,
        imageId: input.imageId,
        placement: input.placement,
        startDate: input.startDate,
        endDate: input.endDate,
        priority: input.priority,
        targetRole: input.targetRole,
        targetCourseId: input.targetCourseId
      })

      return ok(announcement)
    } catch (error) {
      return err(new Error("Error al crear anuncio"))
    }
  }
})

// ============ UPDATE ANNOUNCEMENT ============

const updateAnnouncementSchema = z.object({
  announcementId: z.string(),
  title: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  ctaLink: z.string().optional().nullable(),
  ctaText: z.string().optional().nullable(),
  imageId: z.string().optional().nullable(),
  placement: z
    .enum([
      "DASHBOARD_BANNER",
      "COURSE_BANNER",
      "GLOBAL_MODAL",
      "INLINE_FEED",
      "LOGIN_PAGE"
    ])
    .optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  priority: z.number().optional(),
  isActive: z.boolean().optional(),
  targetRole: z.enum(["STUDENT", "INSTRUCTOR", "ADMIN"]).optional().nullable(),
  targetCourseId: z.string().optional().nullable()
})

export const updateAnnouncement = createAction({
  name: "instructor.updateAnnouncement",
  requireAuth: true,
  allowedRoles: ["INSTRUCTOR", "ADMIN"],
  schema: updateAnnouncementSchema,
  execute: async (input, _context) => {
    try {
      const { announcementId, ...data } = input

      const announcement = await instructorRepository.updateAnnouncement(
        announcementId,
        data
      )

      return ok(announcement)
    } catch (error) {
      return err(new Error("Error al actualizar anuncio"))
    }
  }
})

// ============ DELETE ANNOUNCEMENT ============

export const deleteAnnouncement = createAction({
  name: "instructor.deleteAnnouncement",
  requireAuth: true,
  allowedRoles: ["INSTRUCTOR", "ADMIN"],
  schema: z.object({
    announcementId: z.string()
  }),
  execute: async (input, _context) => {
    try {
      await instructorRepository.deleteAnnouncement(input.announcementId)
      return ok({ success: true })
    } catch (error) {
      return err(new Error("Error al eliminar anuncio"))
    }
  }
})
