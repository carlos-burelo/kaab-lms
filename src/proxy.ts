import { type NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { AUTH_ROUTES, getDefaultDashboard, hasAccessToRoute, isProtectedRoute, PUBLIC_ROUTES } from '@/lib/auth-config'

/**
 * Proxy / Middleware de autenticación y autorización
 * Verifica que el usuario tenga acceso a la ruta solicitada según su rol
 * Este archivo se ejecuta en el Edge Runtime antes de llegar a la aplicación
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const session = await auth()
  const userRole = session?.user?.role

  // Rutas públicas - permitir acceso sin autenticación
  if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    // Si ya está autenticado y accede a rutas de auth, redirigir al dashboard
    if (userRole && AUTH_ROUTES.some((route) => pathname.startsWith(route))) {
      const redirectUrl = new URL(getDefaultDashboard(userRole), request.nextUrl.origin)
      return NextResponse.redirect(redirectUrl)
    }
    return NextResponse.next()
  }

  // Rutas protegidas - verificar autenticación y rol
  if (isProtectedRoute(pathname)) {
    // No está autenticado
    if (!session || !userRole) {
      const loginUrl = new URL('/sign-in', request.nextUrl.origin)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Verificar permisos por rol
    if (!hasAccessToRoute(userRole, pathname)) {
      const redirectUrl = new URL(getDefaultDashboard(userRole), request.nextUrl.origin)
      return NextResponse.redirect(redirectUrl)
    }

    return NextResponse.next()
  }

  return NextResponse.next()
}

/**
 * Configuración del matcher para el middleware
 * Especifica qué rutas ejecutarán este middleware
 */
export const config = {
  matcher: [
    // Proteger todas las rutas excepto:
    '/((?!_next/static|_next/image|favicon.ico|api/auth).*)',
    // Incluir APIs de autenticación
    '/api/auth/:path*'
  ]
}
