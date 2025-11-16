# Guía de Autenticación y Autorización SSR

## Descripción General

La autenticación en KAAB se implementa completamente en el servidor (SSR) usando:

1. **NextAuth v5** - Gestión de sesiones y autenticación
2. **proxy.ts** - Middleware en Edge Runtime para verificar roles por ruta
3. **auth-utils.ts** - Funciones SSR para proteger páginas
4. **auth-config.ts** - Configuración centralizada de rutas y roles

## Arquitectura

```
┌─────────────────────────────────────────────────┐
│         Navegador / Cliente                     │
└──────────────────┬──────────────────────────────┘
                   │ Request
                   ▼
┌─────────────────────────────────────────────────┐
│   proxy.ts (Edge Runtime)                       │
│   - Verifica autenticación                      │
│   - Valida rol por ruta                         │
│   - Redirige si no autorizado                   │
└──────────────────┬──────────────────────────────┘
                   │ Autorizado
                   ▼
┌─────────────────────────────────────────────────┐
│   Páginas/Componentes SSR                       │
│   - requireAuth() - Verificación básica         │
│   - requireRole() - Verificación por rol        │
│   - requireAdmin() - Solo para ADMIN            │
│   - getOptionalSession() - Sesión opcional      │
└──────────────────┬──────────────────────────────┘
                   │ Renderización
                   ▼
┌─────────────────────────────────────────────────┐
│   HTML Renderizado en Servidor                  │
└─────────────────────────────────────────────────┘
```

## Flujo de Autenticación

### 1. Usuario No Autenticado

```
Usuario sin sesión → proxy.ts → /sign-in (redirect)
```

### 2. Usuario Autenticado sin Permiso

```
Usuario con rol STUDENT → /instructor (ruta protegida)
                       → proxy.ts verifica rol
                       → No tiene permiso INSTRUCTOR
                       → /estudiante (redirect al dashboard)
```

### 3. Usuario Autorizado

```
Usuario ADMIN → /administrador (ruta protegida)
            → proxy.ts verifica rol
            → Tiene permiso ADMIN
            → Página cargada ✓
```

## Uso en Páginas

### Página Pública (Sin Protección)

```typescript
// src/app/page.tsx
export default async function HomePage() {
  return <div>Página pública</div>
}
```

### Página Protegida (Requiere Autenticación)

```typescript
// src/app/(plataforma)/estudiante/page.tsx
import { requireAuth } from '@/lib/auth-utils'

export default async function StudentPage() {
  const user = await requireAuth()

  return <div>Bienvenido {user.name}</div>
}
```

### Página Protegida por Rol (Solo Instructor)

```typescript
// src/app/(plataforma)/instructor/page.tsx
import { requireInstructor } from '@/lib/auth-utils'

export default async function InstructorPage() {
  const user = await requireInstructor()

  return <div>Panel de Instructor - {user.name}</div>
}
```

### Página Protegida por Rol (Solo Admin)

```typescript
// src/app/(plataforma)/administrador/page.tsx
import { requireAdmin } from '@/lib/auth-utils'

export default async function AdminPage() {
  const user = await requireAdmin()

  return <div>Panel de Admin</div>
}
```

### Rol Personalizado

```typescript
// Verificar múltiples roles
import { requireRole } from '@/lib/auth-utils'

export default async function CustomPage() {
  const user = await requireRole(['INSTRUCTOR', 'ADMIN'])

  return <div>Solo instructores y admins</div>
}
```

## Funciones Disponibles

### `requireAuth()`

Verifica que el usuario esté autenticado. Redirige a `/sign-in` si no lo está.

```typescript
const user = await requireAuth()
// user: { id, name, email, role, imagen }
```

### `requireRole(roles)`

Verifica que el usuario tenga uno de los roles especificados.

```typescript
// Un solo rol
const user = await requireRole('INSTRUCTOR')

// Múltiples roles
const user = await requireRole(['INSTRUCTOR', 'ADMIN'])
```

### `requireAdmin()`

Alias para `requireRole('ADMIN')`.

```typescript
const user = await requireAdmin()
```

### `requireInstructor()`

Alias para `requireRole(['INSTRUCTOR', 'ADMIN'])`.

```typescript
const user = await requireInstructor()
```

### `requireStudent()`

Alias para `requireRole('STUDENT')`.

```typescript
const user = await requireStudent()
```

### `getOptionalSession()`

Obtiene la sesión sin requerir autenticación. Retorna `null` si no está autenticado.

```typescript
const user = await getOptionalSession()

if (user) {
  // Usuario autenticado
} else {
  // Usuario no autenticado
}
```

### `checkAccess(pathname)`

Verifica si el usuario actual tiene acceso a una ruta.

```typescript
const hasAccess = await checkAccess('/instructor/cursos')
```

## Configuración de Rutas

Edita `src/lib/auth-config.ts` para configurar las rutas protegidas:

```typescript
export const PROTECTED_ROUTES = {
  instructor: {
    paths: ['/instructor'],
    roles: ['INSTRUCTOR', 'ADMIN']
  },

  student: {
    paths: ['/estudiante'],
    roles: ['STUDENT', 'INSTRUCTOR', 'ADMIN']
  },

  admin: {
    paths: ['/administrador'],
    roles: ['ADMIN']
  }
}
```

### Agregar Nueva Ruta Protegida

```typescript
export const PROTECTED_ROUTES = {
  // ... rutas existentes

  moderator: {
    paths: ['/moderador'],
    roles: ['MODERATOR', 'ADMIN']
  }
}
```

## Rutas Públicas

Las rutas públicas no requieren autenticación:

```typescript
export const PUBLIC_ROUTES = [
  '/sign-in',
  '/sign-up',
  '/forgot-password',
  '/'
]
```

## Seguridad

### ✅ Verificaciones en proxy.ts

1. **Edge Runtime** - Se ejecuta en el servidor ANTES de llegar a la aplicación
2. **Validación de Rol** - Verifica el rol del usuario contra la ruta
3. **Redirección** - Si no autorizado, redirige al dashboard correspondiente
4. **Sin Datos Sensibles** - No expone información al cliente

### ✅ Verificaciones en Páginas

1. **Doble Verificación** - Las páginas también verifican autenticación
2. **SSR** - Todo se renderiza en el servidor
3. **No Expone Rutas** - Las rutas protegidas no se pueden acceder sin autenticación

### ❌ Evita

```typescript
// ❌ NO hacer esto - expone la lógica en el cliente
if (userRole === 'ADMIN') {
  return <AdminPanel />
}
```

```typescript
// ❌ NO usar componentes 'use client' para protección
'use client'
export default function AdminPage() {
  if (!session) {
    // Esto puede ser burlado desde el navegador
  }
}
```

## Flujo de Login

1. Usuario accede a `/sign-in`
2. Completa el formulario de login
3. NextAuth verifica credenciales
4. Se crea la sesión (JWT + Cookie segura)
5. Usuario es redirigido a `/estudiante` o `/instructor` según su rol
6. proxy.ts valida cada request
7. Las páginas SSR verifican autenticación

## Flujo de Logout

1. Usuario hace click en "Cerrar Sesión"
2. Se ejecuta `signOut()` de NextAuth
3. La sesión se elimina
4. Se redirige a `/sign-in`
5. proxy.ts bloquea acceso a rutas protegidas

## Mejores Prácticas

### ✅ Hacer

```typescript
// Usar requireAuth() para verificar autenticación
export default async function MyPage() {
  const user = await requireAuth()

  // Ahora sabemos que el usuario está autenticado
  const data = await fetchUserData(user.id)

  return <div>{data}</div>
}
```

```typescript
// Usar roles para autorización
export default async function AdminPage() {
  await requireAdmin()
  // Solo admins aquí
}
```

```typescript
// Usar getOptionalSession() para contenido condicional
export default async function HomePage() {
  const user = await getOptionalSession()

  return (
    <div>
      {user ? (
        <p>Bienvenido {user.name}</p>
      ) : (
        <Link href="/sign-in">Login</Link>
      )}
    </div>
  )
}
```

### ❌ No Hacer

```typescript
// ❌ No confiar en el lado del cliente
const session = useSession() // Evitar en páginas protegidas
```

```typescript
// ❌ No exponer rutas sin verificación
export default async function AdminPage() {
  // Sin await requireAdmin()
  return <AdminPanel />
}
```

```typescript
// ❌ No almacenar datos sensibles en el cliente
localStorage.setItem('role', user.role) // Malo
```

## Debugging

### Verificar Sesión Actual

```typescript
import { getSession } from '@/lib/auth'

const session = await getSession()
console.log(session) // { user: { id, name, email, role }, ... }
```

### Verificar Acceso a Ruta

```typescript
import { hasAccessToRoute } from '@/lib/auth-config'

const hasAccess = hasAccessToRoute('STUDENT', '/instructor')
console.log(hasAccess) // false
```

### Logs en proxy.ts

Agrega logs para debugging:

```typescript
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const session = await auth()

  console.log(`[AUTH] ${pathname} - Role: ${session?.user?.role}`)

  // ... resto del código
}
```

## Resolución de Problemas

### Usuario No Puede Acceder a su Dashboard

1. Verifica que la ruta esté en `PROTECTED_ROUTES`
2. Verifica que el rol del usuario esté en `roles`
3. Verifica que la sesión sea válida en `getSession()`
4. Revisa los logs en proxy.ts

### Redirección Infinita

1. Verifica que no haya ciclos en `getDefaultDashboard()`
2. Verifica que `/sign-in` esté en `PUBLIC_ROUTES`
3. Verifica que la sesión se cree correctamente

### Sesión No Persiste

1. Verifica que `NEXTAUTH_SECRET` esté configurado
2. Verifica que las cookies estén habilitadas
3. Verifica que `process.env.NEXTAUTH_URL` sea correcto

## Referencias

- [NextAuth.js Documentation](https://authjs.dev/)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Server-Side Rendering](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
