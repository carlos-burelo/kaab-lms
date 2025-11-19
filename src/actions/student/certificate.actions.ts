'use server'

import { createAction } from '@/actions/_shared/action-builder'
import { err, ok } from '@/core/shared/result'
import { studentRepository } from '@/database/repositories/student.repository'

// ============ GET CERTIFICATES ============

/**
 * Obtiene todos los certificados ganados por el estudiante
 */
export const getCertificates = createAction({
  name: 'student.getCertificates',
  requireAuth: true,
  allowedRoles: ['STUDENT'],
  execute: async (_, context) => {
    try {
      const certificates = await studentRepository.getCertificates(context.userId)
      return ok(certificates || [])
    } catch (_error) {
      return err(new Error('Error al obtener certificados'))
    }
  }
})
