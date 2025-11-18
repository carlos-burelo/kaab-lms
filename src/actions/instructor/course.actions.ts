"use server"

import { z } from "zod"
import { createAction } from "@/actions/_shared/action-builder"
import { idSchema } from "@/actions/_shared/validators"
import { instructorRepository } from "@/database/repositories/instructor.repository"
import { ok, err } from "@/core/shared/result"

// ============ SCHEMAS ============

const getCourseDetailSchema = z.object({
  courseId: idSchema
})

// ============ GET MY COURSES ============

/**
 * Obtiene todos los cursos creados por el instructor
 */
export const getMyCourses = createAction({
  name: "instructor.getMyCourses",
  requireAuth: true,
  allowedRoles: ["INSTRUCTOR"],
  execute: async (_, context) => {
    try {
      const courses = await instructorRepository.getMyCourses(context.userId)
      return ok(courses || [])
    } catch (error) {
      return err(new Error("Error al obtener cursos"))
    }
  }
})

// ============ GET COURSE DETAIL ============

/**
 * Obtiene los detalles completos de un curso
 */
export const getCourseDetail = createAction({
  name: "instructor.getCourseDetail",
  schema: getCourseDetailSchema,
  requireAuth: true,
  allowedRoles: ["INSTRUCTOR"],
  execute: async (input, context) => {
    try {
      const course = await instructorRepository.getCourseDetail(
        input.courseId,
        context.userId
      )

      if (!course) {
        return err(new Error("Curso no encontrado"))
      }

      // Verify ownership
      if (course.instructorId !== context.userId) {
        return err(new Error("No tienes permiso para acceder a este curso"))
      }

      return ok(course)
    } catch (error) {
      return err(new Error("Error al obtener detalles del curso"))
    }
  }
})

// ============ GET COURSE STUDENTS PROGRESS ============

/**
 * Obtiene el progreso de todos los estudiantes en un curso
 */
export const getCourseStudentsProgress = createAction({
  name: "instructor.getCourseStudentsProgress",
  schema: z.object({ courseId: idSchema }),
  requireAuth: true,
  allowedRoles: ["INSTRUCTOR"],
  execute: async (input, context) => {
    try {
      // Verify ownership
      const course = await instructorRepository.getCourseById(input.courseId)

      if (!course) {
        return err(new Error("Curso no encontrado"))
      }

      if (course.instructorId !== context.userId) {
        return err(new Error("No tienes permiso para acceder a este curso"))
      }

      const progress = await instructorRepository.getCourseStudentsProgress(
        input.courseId
      )

      return ok(progress || [])
    } catch (error) {
      return err(new Error("Error al obtener progreso de estudiantes"))
    }
  }
})

// ============ GET REVIEWS ============

/**
 * Obtiene todas las reseñas de los cursos del instructor
 */
export const getReviews = createAction({
  name: "instructor.getReviews",
  requireAuth: true,
  allowedRoles: ["INSTRUCTOR"],
  execute: async (_, context) => {
    try {
      const reviews = await instructorRepository.getReviews(context.userId)
      return ok(reviews || [])
    } catch (error) {
      return err(new Error("Error al obtener reseñas"))
    }
  }
})
