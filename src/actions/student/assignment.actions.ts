"use server"

import { z } from "zod"
import { createAction } from "@/actions/_shared/action-builder"
import { idSchema } from "@/actions/_shared/validators"
import { studentRepository } from "@/database/repositories/student.repository"
import { ok, err } from "@/core/shared/result"

// ============ SCHEMAS ============

const getAssignmentSubmissionsSchema = z.object({
  courseId: idSchema
})

const submitAssignmentSchema = z.object({
  assignmentId: idSchema,
  submissionText: z.string().nullable().optional(),
  fileIds: z.array(idSchema).optional().default([])
})

// ============ GET ASSIGNMENT SUBMISSIONS ============

/**
 * Obtiene todas las entregas de asignaciones del estudiante en un curso
 */
export const getAssignmentSubmissions = createAction({
  name: "student.getAssignmentSubmissions",
  schema: getAssignmentSubmissionsSchema,
  requireAuth: true,
  allowedRoles: ["STUDENT"],
  execute: async (input, context) => {
    try {
      const submissions = await studentRepository.getStudentAssignmentSubmissions(
        context.userId,
        input.courseId
      )

      return ok(submissions || [])
    } catch (_error) {
      return err(new Error("Error al obtener entregas de asignaciones"))
    }
  }
})

// ============ SUBMIT ASSIGNMENT ============

/**
 * Envía una asignación
 */
export const submitAssignment = createAction({
  name: "student.submitAssignment",
  schema: submitAssignmentSchema,
  requireAuth: true,
  allowedRoles: ["STUDENT"],
  execute: async (input, context) => {
    try {
      const submission = await studentRepository.submitAssignment({
        assignmentId: input.assignmentId,
        userId: context.userId,
        submissionText: input.submissionText || null,
        fileIds: input.fileIds || []
      })

      if (!submission) {
        return err(new Error("No se pudo enviar la asignación"))
      }

      return ok(submission)
    } catch (_error) {
      return err(new Error("Error al enviar asignación"))
    }
  }
})
