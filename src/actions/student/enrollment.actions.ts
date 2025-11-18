"use server"

import { z } from "zod"
import { createAction } from "@/actions/_shared/action-builder"
import { idSchema, paginationSchema } from "@/actions/_shared/validators"
import { studentRepository } from "@/database/repositories/student.repository"
import { Result, ok, err } from "@/core/shared/result"

// ============ SCHEMAS ============

const enrollInCourseSchema = z.object({
  courseId: idSchema
})

const getCourseProgressSchema = z.object({
  courseId: idSchema
})

const getAvailableCoursesSchema = paginationSchema

// ============ GET ENROLLED COURSES ============

/**
 * Obtiene todos los cursos en los que está inscrito el estudiante actual
 */
export const getEnrolledCourses = createAction({
  name: "student.getEnrolledCourses",
  requireAuth: true,
  allowedRoles: ["STUDENT"],
  execute: async (_, context) => {
    try {
      const courses = await studentRepository.getEnrolledCourses(context.userId)
      return ok(courses || [])
    } catch (error) {
      return err(new Error("Error al obtener cursos inscritos"))
    }
  }
})

// ============ GET COURSE PROGRESS ============

/**
 * Obtiene el progreso del estudiante en un curso específico
 */
export const getCourseProgress = createAction({
  name: "student.getCourseProgress",
  schema: getCourseProgressSchema,
  requireAuth: true,
  allowedRoles: ["STUDENT"],
  execute: async (input, context) => {
    try {
      const progress = await studentRepository.getCourseProgress(
        context.userId,
        input.courseId
      )

      if (!progress) {
        return err(new Error("No se encontró progreso para este curso"))
      }

      return ok(progress)
    } catch (error) {
      return err(new Error("Error al obtener progreso del curso"))
    }
  }
})

// ============ GET COMPLETED LESSONS ============

/**
 * Obtiene todas las lecciones completadas por el estudiante
 */
export const getCompletedLessons = createAction({
  name: "student.getCompletedLessons",
  requireAuth: true,
  allowedRoles: ["STUDENT"],
  execute: async (_, context) => {
    try {
      const lessons = await studentRepository.getCompletedLessons(context.userId)
      return ok(lessons || [])
    } catch (error) {
      return err(new Error("Error al obtener lecciones completadas"))
    }
  }
})

// ============ GET AVAILABLE COURSES ============

/**
 * Obtiene cursos públicos disponibles (no inscritos)
 */
export const getAvailableCourses = createAction({
  name: "student.getAvailableCourses",
  schema: getAvailableCoursesSchema.optional(),
  requireAuth: true,
  allowedRoles: ["STUDENT"],
  execute: async (input, context) => {
    try {
      const page = input?.page || 1
      const limit = input?.limit || 20
      const skip = (page - 1) * limit

      const courses = await studentRepository.getAvailableCourses(
        context.userId,
        limit,
        skip
      )

      return ok({
        courses: courses || [],
        page,
        limit,
        hasMore: (courses?.length || 0) === limit
      })
    } catch (error) {
      return err(new Error("Error al obtener cursos disponibles"))
    }
  }
})

// ============ CHECK ENROLLMENT ============

/**
 * Verifica si el estudiante está inscrito en un curso
 */
export const checkEnrollment = createAction({
  name: "student.checkEnrollment",
  schema: z.object({ courseId: idSchema }),
  requireAuth: true,
  allowedRoles: ["STUDENT"],
  execute: async (input, context) => {
    try {
      const enrollment = await studentRepository.getEnrollmentByCourseId(
        input.courseId,
        context.userId
      )

      return ok({
        isEnrolled: !!enrollment,
        enrollment: enrollment || null
      })
    } catch (error) {
      return err(new Error("Error al verificar inscripción"))
    }
  }
})

// ============ ENROLL IN COURSE ============

/**
 * Inscribe al estudiante en un curso
 * TODO: Migrar a use case cuando esté disponible
 */
export const enrollInCourse = createAction({
  name: "student.enrollInCourse",
  schema: enrollInCourseSchema,
  requireAuth: true,
  allowedRoles: ["STUDENT"],
  execute: async (input, context) => {
    try {
      // TODO: Esto debería llamar al use case EnrollInCourseUseCase
      // Por ahora, retornamos un placeholder
      return err(new Error("Funcionalidad en desarrollo. Usar EnrollInCourseUseCase"))
    } catch (error) {
      return err(new Error("Error al inscribirse en el curso"))
    }
  }
})
