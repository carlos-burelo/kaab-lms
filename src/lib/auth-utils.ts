/**
 * Utilidades de autenticación para SSR
 * Todas las verificaciones se hacen en el servidor
 */

import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getDefaultDashboard, hasAccessToRoute } from '@/lib/auth-config'

/**
 * Obtiene la sesión actual o redirige al login
 * Usar en páginas protegidas
 */
export async function requireAuth() {
  const session = await getSession()

  if (!session?.id) {
    redirect('/sign-in')
  }

  return session
}

/**
 * Verifica que el usuario tenga un rol específico
 * Redirige al dashboard si no tiene permiso
 */
export async function requireRole(requiredRoles: string | string[]) {
  const session = await getSession()

  if (!session?.id) {
    redirect('/sign-in')
  }

  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles]

  if (!roles.includes(session.role || '')) {
    redirect(getDefaultDashboard(session.role || 'STUDENT'))
  }

  return session
}

/**
 * Verifica que el usuario sea ADMIN
 */
export async function requireAdmin() {
  return requireRole('ADMIN')
}

/**
 * Verifica que el usuario sea INSTRUCTOR o ADMIN
 */
export async function requireInstructor() {
  return requireRole(['INSTRUCTOR', 'ADMIN'])
}

/**
 * Verifica que el usuario sea STUDENT (no admin ni instructor)
 */
export async function requireStudent() {
  return requireRole('STUDENT')
}

/**
 * Obtiene la sesión sin requerir autenticación
 * Retorna null si no está autenticado
 */
export async function getOptionalSession() {
  try {
    const session = await getSession()
    return session || null
  } catch {
    return null
  }
}

/**
 * Verifica si un usuario tiene acceso a una ruta
 */
export async function checkAccess(pathname: string): Promise<boolean> {
  try {
    const session = await getSession()
    if (!session?.id) return false

    return hasAccessToRoute(session.role || '', pathname)
  } catch {
    return false
  }
}
