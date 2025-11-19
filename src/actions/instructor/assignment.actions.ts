"use server"

import { z } from "zod"
import { createAction } from "@/actions/_shared/action-builder"
import { idSchema } from "@/actions/_shared/validators"
import { instructorRepository } from "@/database/repositories/instructor.repository"
import { ok, err } from "@/core/shared/result"

// ============ SCHEMAS ============

const createAssignmentSchema = z.object({
  lessonId: idSchema,
  title: z.string().min(1, "Título requerido"),
  description: z.string().nullable().optional(),
  instructions: z.string().nullable().optional(),
  dueDate: z.string().or(z.date()).transform((val) =>
    typeof val === "string" ? new Date(val) : val
  ),
  maxScore: z.number().int().positive(),
  allowLateSubmission: z.boolean().default(false),
  latePenaltyPercent: z.number().min(0).max(100).nullable().optional()
})

const updateAssignmentSchema = z.object({
  assignmentId: idSchema,
  title: z.string().min(1, "Título requerido"),
  description: z.string().nullable().optional(),
  instructions: z.string().nullable().optional(),
  dueDate: z.string().or(z.date()).transform((val) =>
    typeof val === "string" ? new Date(val) : val
  ),
  maxScore: z.number().int().positive(),
  allowLateSubmission: z.boolean(),
  latePenaltyPercent: z.number().min(0).max(100).nullable().optional()
})

const gradeSubmissionSchema = z.object({
  submissionId: idSchema,
  score: z.number().min(0),
  feedback: z.string().nullable().optional(),
  status: z.enum(["GRADED", "NEEDS_REVISION"])
})

// ============ GET PENDING SUBMISSIONS ============

/**
 * Obtiene todas las entregas pendientes de calificación
 */
export const getPendingSubmissions = createAction({
  name: "instructor.getPendingSubmissions",
  requireAuth: true,
  allowedRoles: ["INSTRUCTOR"],
  execute: async (_, context) => {
    try {
      const submissions = await instructorRepository.getPendingSubmissions(
        context.userId
      )
      return ok(submissions || [])
    } catch (_error) {
      return err(new Error("Error al obtener entregas pendientes"))
    }
  }
})

// ============ GET ASSIGNMENT BY ID ============

/**
 * Obtiene una asignación por ID con todas sus entregas
 */
export const getAssignmentById = createAction({
  name: "instructor.getAssignmentById",
  schema: z.object({ assignmentId: idSchema }),
  requireAuth: true,
  allowedRoles: ["INSTRUCTOR"],
  execute: async (input) => {
    try {
      const assignment = await instructorRepository.getAssignmentById(
        input.assignmentId
      )

      if (!assignment) {
        return err(new Error("Asignación no encontrada"))
      }

      return ok(assignment)
    } catch (_error) {
      return err(new Error("Error al obtener asignación"))
    }
  }
})

// ============ GET ASSIGNMENT SUBMISSIONS ============

/**
 * Obtiene todas las entregas de una asignación
 */
export const getAssignmentSubmissions = createAction({
  name: "instructor.getAssignmentSubmissions",
  schema: z.object({ assignmentId: idSchema }),
  requireAuth: true,
  allowedRoles: ["INSTRUCTOR"],
  execute: async (input) => {
    try {
      const submissions = await instructorRepository.getAssignmentSubmissions(
        input.assignmentId
      )

      return ok(submissions || [])
    } catch (_error) {
      return err(new Error("Error al obtener entregas"))
    }
  }
})

// ============ CREATE ASSIGNMENT ============

/**
 * Crea una nueva asignación en una lección
 */
export const createAssignment = createAction({
  name: "instructor.createAssignment",
  schema: createAssignmentSchema,
  requireAuth: true,
  allowedRoles: ["INSTRUCTOR"],
  execute: async (input) => {
    try {
      const assignment = await instructorRepository.createAssignment({
        lessonId: input.lessonId,
        title: input.title,
        description: input.description || null,
        instructions: input.instructions || null,
        dueDate: input.dueDate,
        maxScore: input.maxScore,
        allowLateSubmission: input.allowLateSubmission,
        latePenaltyPercent: input.latePenaltyPercent || null
      })

      if (!assignment) {
        return err(new Error("No se pudo crear la asignación"))
      }

      return ok(assignment)
    } catch (_error) {
      return err(new Error("Error al crear asignación"))
    }
  }
})

// ============ UPDATE ASSIGNMENT ============

/**
 * Actualiza una asignación existente
 */
export const updateAssignment = createAction({
  name: "instructor.updateAssignment",
  schema: updateAssignmentSchema,
  requireAuth: true,
  allowedRoles: ["INSTRUCTOR"],
  execute: async (input) => {
    try {
      const assignment = await instructorRepository.updateAssignment(
        input.assignmentId,
        {
          title: input.title,
          description: input.description || null,
          instructions: input.instructions || null,
          dueDate: input.dueDate,
          maxScore: input.maxScore,
          allowLateSubmission: input.allowLateSubmission,
          latePenaltyPercent: input.latePenaltyPercent || null
        }
      )

      if (!assignment) {
        return err(new Error("No se pudo actualizar la asignación"))
      }

      return ok(assignment)
    } catch (_error) {
      return err(new Error("Error al actualizar asignación"))
    }
  }
})

// ============ DELETE ASSIGNMENT ============

/**
 * Elimina una asignación
 */
export const deleteAssignment = createAction({
  name: "instructor.deleteAssignment",
  schema: z.object({ assignmentId: idSchema }),
  requireAuth: true,
  allowedRoles: ["INSTRUCTOR"],
  execute: async (input) => {
    try {
      await instructorRepository.deleteAssignment(input.assignmentId)
      return ok({ success: true })
    } catch (_error) {
      return err(new Error("Error al eliminar asignación"))
    }
  }
})

// ============ GRADE SUBMISSION ============

/**
 * Califica una entrega de asignación
 */
export const gradeSubmission = createAction({
  name: "instructor.gradeSubmission",
  schema: gradeSubmissionSchema,
  requireAuth: true,
  allowedRoles: ["INSTRUCTOR"],
  execute: async (input) => {
    try {
      const graded = await instructorRepository.gradeAssignmentSubmission(
        input.submissionId,
        {
          score: input.score,
          feedback: input.feedback || null,
          status: input.status
        }
      )

      if (!graded) {
        return err(new Error("No se pudo calificar la entrega"))
      }

      return ok(graded)
    } catch (_error) {
      return err(new Error("Error al calificar entrega"))
    }
  }
})
