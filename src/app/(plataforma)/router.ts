import { UserRole } from '@prisma/client'
import STUDENT_ROUTES from '@/app/(plataforma)/estudiante/routes'
import INSTRUCTOR_ROUTES from '@/app/(plataforma)/instructor/routes'
import ADMIN_ROUTES from '@/app/(plataforma)/administrador/routes'

export function getNavigationByRole(role: UserRole) {
  switch (role) {
    case UserRole.STUDENT:
      return STUDENT_ROUTES
    case UserRole.INSTRUCTOR:
      return INSTRUCTOR_ROUTES
    case UserRole.ADMIN:
      return ADMIN_ROUTES
    default:
      return []
  }
}

export function getPrefixByRole(role: UserRole) {
  switch (role) {
    case UserRole.STUDENT:
      return '/estudiante'
    case UserRole.INSTRUCTOR:
      return '/instructor'
    default:
      return '/administrador'
  }
}
