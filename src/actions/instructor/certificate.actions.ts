'use server'

import { z } from 'zod'
import { createAction } from '@/actions/_shared/action-builder'
import { idSchema } from '@/actions/_shared/validators'
import { err, ok } from '@/core/shared/result'
import { instructorRepository } from '@/database/repositories/instructor.repository'

// ============ GET CERTIFICATE TEMPLATES ============

/**
 * Obtiene todas las plantillas de certificados
 */
export const getCertificateTemplates = createAction({
  name: 'instructor.getCertificateTemplates',
  requireAuth: true,
  allowedRoles: ['INSTRUCTOR'],
  execute: async () => {
    try {
      const templates = await instructorRepository.getCertificateTemplates()
      return ok(templates || [])
    } catch (_error) {
      return err(new Error('Error al obtener plantillas de certificados'))
    }
  }
})

// ============ GET ISSUED CERTIFICATES ============

/**
 * Obtiene todos los certificados emitidos en un curso
 */
export const getIssuedCertificates = createAction({
  name: 'instructor.getIssuedCertificates',
  schema: z.object({ courseId: idSchema }),
  requireAuth: true,
  allowedRoles: ['INSTRUCTOR'],
  execute: async (input, context) => {
    try {
      // Verify ownership
      const course = await instructorRepository.getCourseById(input.courseId)

      if (!course) {
        return err(new Error('Curso no encontrado'))
      }

      if (course.instructorId !== context.userId) {
        return err(new Error('No tienes permiso para acceder a este curso'))
      }

      const certificates = await instructorRepository.getIssuedCertificates(input.courseId)

      return ok(certificates || [])
    } catch (_error) {
      return err(new Error('Error al obtener certificados emitidos'))
    }
  }
})
