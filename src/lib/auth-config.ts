/**
 * Configuración de rutas protegidas por rol
 * Define qué rutas requieren qué roles
 */

export const PROTECTED_ROUTES = {
  // Rutas de Instructor (INSTRUCTOR, ADMIN)
  instructor: {
    paths: ['/instructor'],
    roles: ['INSTRUCTOR', 'ADMIN']
  },

  // Rutas de Estudiante (STUDENT, INSTRUCTOR, ADMIN)
  student: {
    paths: ['/estudiante'],
    roles: ['STUDENT', 'INSTRUCTOR', 'ADMIN']
  },

  // Rutas de Administrador (solo ADMIN)
  admin: {
    paths: ['/administrador'],
    roles: ['ADMIN']
  }
}

// Rutas públicas (sin protección)
export const PUBLIC_ROUTES = [
  '/sign-in',
  '/sign-up',
  '/forgot-password',
  '/verify-otp',
  '/change-password',
  '/',
  '/api/auth'
]

// Rutas que redirigen a dashboard si ya estás autenticado
export const AUTH_ROUTES = [
  '/sign-in',
  '/sign-up',
  '/forgot-password',
  '/verify-otp'
]

/**
 * Obtiene el dashboard por defecto según el rol
 */
export function getDefaultDashboard(role: string): string {
  switch (role) {
    case 'ADMIN':
      return '/administrador'
    case 'INSTRUCTOR':
      return '/instructor'
    case 'STUDENT':
      return '/estudiante'
    default:
      return '/sign-in'
  }
}

/**
 * Verifica si una ruta requiere autenticación
 */
export function isProtectedRoute(pathname: string): boolean {
  return Object.values(PROTECTED_ROUTES).some((route) =>
    route.paths.some((path) => pathname.startsWith(path))
  )
}

/**
 * Obtiene los roles requeridos para una ruta
 */
export function getRequiredRolesForRoute(pathname: string): string[] | null {
  for (const route of Object.values(PROTECTED_ROUTES)) {
    if (route.paths.some((path) => pathname.startsWith(path))) {
      return route.roles
    }
  }
  return null
}

/**
 * Verifica si un usuario tiene acceso a una ruta
 */
export function hasAccessToRoute(userRole: string, pathname: string): boolean {
  const requiredRoles = getRequiredRolesForRoute(pathname)
  if (!requiredRoles) return true // Ruta pública
  return requiredRoles.includes(userRole)
}

/**
 * Obtiene el destino de redirección según el contexto
 */
export function getRedirectDestination(
  currentPath: string,
  userRole: string | undefined
): string {
  // Si no está autenticado, ir a login
  if (!userRole) {
    return '/sign-in'
  }

  // Si es una ruta de auth y está autenticado, ir al dashboard
  if (AUTH_ROUTES.some((route) => currentPath.startsWith(route))) {
    return getDefaultDashboard(userRole)
  }

  // Si intenta acceder a una ruta protegida sin permisos, ir a dashboard
  if (isProtectedRoute(currentPath) && !hasAccessToRoute(userRole, currentPath)) {
    return getDefaultDashboard(userRole)
  }

  return currentPath
}
