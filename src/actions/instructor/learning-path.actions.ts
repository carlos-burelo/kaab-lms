'use server'

import { z } from 'zod'
import { createAction } from '@/actions/_shared/action-builder'
import { idSchema } from '@/actions/_shared/validators'
import { err, ok } from '@/core/shared/result'
import { instructorRepository } from '@/database/repositories/instructor.repository'

// ============ SCHEMAS ============

const createLearningPathSchema = z.object({
  title: z.string().min(1, 'Título requerido'),
  slug: z.string().min(1, 'Slug requerido'),
  description: z.string().min(1, 'Descripción requerida'),
  level: z.string().min(1, 'Nivel requerido'),
  estimatedDurationDays: z.number().int().positive().optional()
})

const saveLearningPathDesignSchema = z.object({
  learningPathId: idSchema,
  nodes: z.array(z.any()),
  edges: z.array(z.any())
})

// ============ GET LEARNING PATHS ============

/**
 * Obtiene todas las rutas de aprendizaje del instructor
 */
export const getLearningPaths = createAction({
  name: 'instructor.getLearningPaths',
  requireAuth: true,
  allowedRoles: ['INSTRUCTOR'],
  execute: async (_, context) => {
    try {
      const paths = await instructorRepository.getLearningPaths(context.userId)
      return ok(paths || [])
    } catch (_error) {
      return err(new Error('Error al obtener rutas de aprendizaje'))
    }
  }
})

// ============ GET LEARNING PATH DETAIL ============

/**
 * Obtiene los detalles completos de una ruta de aprendizaje
 */
export const getLearningPathDetail = createAction({
  name: 'instructor.getLearningPathDetail',
  schema: z.object({ learningPathId: idSchema }),
  requireAuth: true,
  allowedRoles: ['INSTRUCTOR'],
  execute: async (input, context) => {
    try {
      const path = await instructorRepository.getLearningPathDetail(input.learningPathId, context.userId)

      if (!path) {
        return err(new Error('Ruta de aprendizaje no encontrada'))
      }

      // Verify ownership
      if (path.instructor.userId !== context.userId) {
        return err(new Error('No tienes permiso para acceder a esta ruta'))
      }

      return ok(path)
    } catch (_error) {
      return err(new Error('Error al obtener detalles de la ruta'))
    }
  }
})

// ============ CREATE LEARNING PATH ============

/**
 * Crea una nueva ruta de aprendizaje
 */
export const createLearningPath = createAction({
  name: 'instructor.createLearningPath',
  schema: createLearningPathSchema,
  requireAuth: true,
  allowedRoles: ['INSTRUCTOR'],
  execute: async (input, context) => {
    try {
      const result = await instructorRepository.createLearningPath({
        title: input.title,
        slug: input.slug,
        description: input.description,
        level: input.level,
        estimatedDurationDays: input.estimatedDurationDays,
        instructorId: context.userId
      })

      if (!result.success) {
        return err(new Error(result.error || 'Error al crear ruta'))
      }

      return ok({ id: result.id })
    } catch (_error) {
      return err(new Error('Error al crear ruta de aprendizaje'))
    }
  }
})

// ============ SAVE LEARNING PATH DESIGN ============

/**
 * Guarda el diseño de una ruta de aprendizaje (nodos y edges)
 */
export const saveLearningPathDesign = createAction({
  name: 'instructor.saveLearningPathDesign',
  schema: saveLearningPathDesignSchema,
  requireAuth: true,
  allowedRoles: ['INSTRUCTOR'],
  execute: async (input, context) => {
    try {
      if (!context.session.user.email) {
        return err(new Error('Email de usuario no disponible'))
      }

      await instructorRepository.saveLearningPathDesign(
        input.learningPathId,
        input.nodes,
        input.edges,
        context.session.user.email
      )

      return ok({ success: true })
    } catch (_error) {
      return err(new Error('Error al guardar diseño de la ruta'))
    }
  }
})

// ============ DELETE LEARNING PATH ============

/**
 * Elimina una ruta de aprendizaje
 */
export const deleteLearningPath = createAction({
  name: 'instructor.deleteLearningPath',
  schema: z.object({ learningPathId: idSchema }),
  requireAuth: true,
  allowedRoles: ['INSTRUCTOR'],
  execute: async (input, context) => {
    try {
      if (!context.session.user.email) {
        return err(new Error('Email de usuario no disponible'))
      }

      await instructorRepository.deleteLearningPath(input.learningPathId, context.session.user.email)

      return ok({ success: true })
    } catch (_error) {
      return err(new Error('Error al eliminar ruta de aprendizaje'))
    }
  }
})
