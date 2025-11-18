import { getServerSession as getNextAuthSession } from "next-auth"
import { authOptions } from "@/lib/auth-config"
import type { Session } from "next-auth"

/**
 * Obtiene la sesión del servidor usando NextAuth
 */
export async function getServerSession(): Promise<Session | null> {
  return await getNextAuthSession(authOptions)
}

/**
 * Obtiene la sesión y lanza error si no existe
 */
export async function requireSession(): Promise<Session> {
  const session = await getServerSession()

  if (!session || !session.user) {
    throw new Error("No autorizado. Debes iniciar sesión.")
  }

  return session
}

/**
 * Obtiene el ID del usuario actual
 */
export async function getCurrentUserId(): Promise<string> {
  const session = await requireSession()
  return session.user.id
}

/**
 * Obtiene el rol del usuario actual
 */
export async function getCurrentUserRole(): Promise<string> {
  const session = await requireSession()
  return session.user.role
}

/**
 * Verifica si el usuario tiene un rol específico
 */
export async function hasRole(role: string): Promise<boolean> {
  const session = await getServerSession()

  if (!session || !session.user) {
    return false
  }

  return session.user.role === role
}

/**
 * Verifica si el usuario tiene alguno de los roles especificados
 */
export async function hasAnyRole(roles: string[]): Promise<boolean> {
  const session = await getServerSession()

  if (!session || !session.user) {
    return false
  }

  return roles.includes(session.user.role)
}

/**
 * Requiere que el usuario tenga un rol específico
 */
export async function requireRole(role: string): Promise<void> {
  const userRole = await getCurrentUserRole()

  if (userRole !== role) {
    throw new Error(`Esta acción requiere el rol: ${role}`)
  }
}

/**
 * Requiere que el usuario tenga alguno de los roles especificados
 */
export async function requireAnyRole(roles: string[]): Promise<void> {
  const userRole = await getCurrentUserRole()

  if (!roles.includes(userRole)) {
    throw new Error(`Esta acción requiere uno de los siguientes roles: ${roles.join(", ")}`)
  }
}
