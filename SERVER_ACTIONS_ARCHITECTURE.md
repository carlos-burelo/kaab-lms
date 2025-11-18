# Server Actions Architecture - KAAB LMS

## Overview

Esta arquitectura define un patrón escalable y consistente para Server Actions en Next.js 14+ App Router, alineado con Clean Architecture y Domain-Driven Design (DDD).

## Principios Fundamentales

1. **No API Routes**: Solo NextAuth usa API Routes. Todo lo demás usa Server Actions.
2. **Centralización**: Todas las actions en `/src/actions/` por dominio.
3. **Use Cases First**: Todas las actions deben llamar a use cases, no directamente a repositorios.
4. **Type Safety**: Uso de Zod para validación y tipos seguros.
5. **Result Pattern**: Retornar siempre `Result<T, Error>` para manejo de errores predecible.
6. **Session Management**: Validar sesión y permisos en cada action.

## Estructura de Directorios

```
src/
├── actions/                          # Server Actions (Capa de Aplicación)
│   ├── index.ts                      # Barrel export de todas las actions
│   ├── _shared/                      # Utilidades compartidas
│   │   ├── action-builder.ts         # Helper para crear actions type-safe
│   │   ├── session.ts                # Validación de sesión
│   │   └── validators.ts             # Validators comunes
│   │
│   ├── student/                      # Actions de estudiantes
│   │   ├── index.ts
│   │   ├── enrollment.actions.ts
│   │   ├── course.actions.ts
│   │   ├── gamification.actions.ts
│   │   └── certificate.actions.ts
│   │
│   ├── instructor/                   # Actions de instructores
│   │   ├── index.ts
│   │   ├── course.actions.ts
│   │   ├── student-management.actions.ts
│   │   ├── analytics.actions.ts
│   │   └── certificate.actions.ts
│   │
│   ├── admin/                        # Actions de administrador
│   │   ├── index.ts
│   │   ├── user-management.actions.ts
│   │   ├── course-management.actions.ts
│   │   └── system.actions.ts
│   │
│   └── public/                       # Actions públicas
│       ├── index.ts
│       ├── auth.actions.ts
│       └── course-catalog.actions.ts
│
├── modules/                          # DDD Bounded Contexts
│   └── {module}/
│       ├── domain/
│       ├── application/
│       │   └── use-cases/            # Use Cases llamados por actions
│       └── infrastructure/
│
└── database/
    ├── repositories/                 # Implementaciones de repositorios
    └── contexts/                     # DEPRECATED - migrar a actions
```

## Patrón de Server Actions

### 1. Action Builder (Type-Safe Helper)

```typescript
// src/actions/_shared/action-builder.ts
import { z } from "zod"
import { getServerSession } from "@/lib/auth"
import { Result } from "@/core/shared/result"

export type ActionResult<T> = Promise<{
  success: boolean
  data?: T
  error?: string
}>

export type ActionContext = {
  userId: string
  userRole: string
  session: Session
}

export const createAction = <TInput, TOutput>(config: {
  name: string
  schema?: z.ZodSchema<TInput>
  requireAuth?: boolean
  allowedRoles?: string[]
  execute: (input: TInput, context: ActionContext) => Promise<Result<TOutput, Error>>
}) => {
  return async (input: TInput): ActionResult<TOutput> => {
    try {
      // 1. Validar sesión
      if (config.requireAuth !== false) {
        const session = await getServerSession()
        if (!session) {
          return { success: false, error: "No autorizado" }
        }

        // 2. Validar roles
        if (config.allowedRoles && !config.allowedRoles.includes(session.user.role)) {
          return { success: false, error: "Permisos insuficientes" }
        }

        const context: ActionContext = {
          userId: session.user.id,
          userRole: session.user.role,
          session
        }

        // 3. Validar input con Zod
        if (config.schema) {
          const validation = config.schema.safeParse(input)
          if (!validation.success) {
            return {
              success: false,
              error: validation.error.errors[0].message
            }
          }
        }

        // 4. Ejecutar use case
        const result = await config.execute(input, context)

        // 5. Retornar resultado
        return result.match(
          (data) => ({ success: true, data }),
          (error) => ({ success: false, error: error.message })
        )
      }

      // Sin autenticación requerida
      const result = await config.execute(input, {} as ActionContext)
      return result.match(
        (data) => ({ success: true, data }),
        (error) => ({ success: false, error: error.message })
      )

    } catch (error) {
      console.error(`[Action: ${config.name}]`, error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido"
      }
    }
  }
}
```

### 2. Ejemplo de Action (Student)

```typescript
// src/actions/student/enrollment.actions.ts
"use server"

import { z } from "zod"
import { createAction } from "@/actions/_shared/action-builder"
import { GetEnrolledCoursesUseCase } from "@/modules/enrollment/application/use-cases/get-enrolled-courses.use-case"
import { EnrollInCourseUseCase } from "@/modules/enrollment/application/use-cases/enroll-in-course.use-case"
import { container } from "@/core/infrastructure/container.config"
import { TOKENS } from "@/core/infrastructure/dependency-injection"

// ============ GET ENROLLED COURSES ============
export const getEnrolledCourses = createAction({
  name: "student.getEnrolledCourses",
  requireAuth: true,
  allowedRoles: ["STUDENT"],
  execute: async (input, context) => {
    const useCase = container.get<GetEnrolledCoursesUseCase>(
      TOKENS.GET_ENROLLED_COURSES
    )

    return await useCase.execute({
      studentId: context.userId
    })
  }
})

// ============ ENROLL IN COURSE ============
const enrollSchema = z.object({
  courseId: z.string().min(1, "ID de curso requerido")
})

export const enrollInCourse = createAction({
  name: "student.enrollInCourse",
  schema: enrollSchema,
  requireAuth: true,
  allowedRoles: ["STUDENT"],
  execute: async (input, context) => {
    const useCase = container.get<EnrollInCourseUseCase>(
      TOKENS.ENROLL_IN_COURSE
    )

    return await useCase.execute({
      studentId: context.userId,
      courseId: input.courseId
    })
  }
})

// ============ UPDATE PROGRESS ============
const updateProgressSchema = z.object({
  enrollmentId: z.string(),
  lessonId: z.string(),
  completed: z.boolean()
})

export const updateLessonProgress = createAction({
  name: "student.updateLessonProgress",
  schema: updateProgressSchema,
  requireAuth: true,
  allowedRoles: ["STUDENT"],
  execute: async (input, context) => {
    const useCase = container.get<UpdateLessonProgressUseCase>(
      TOKENS.UPDATE_LESSON_PROGRESS
    )

    return await useCase.execute({
      studentId: context.userId,
      enrollmentId: input.enrollmentId,
      lessonId: input.lessonId,
      completed: input.completed
    })
  }
})
```

### 3. Uso en Componentes (Pages)

```typescript
// src/app/(plataforma)/estudiante/(principal)/page.tsx
import { getEnrolledCourses } from "@/actions/student/enrollment.actions"
import { getGamificationProfile } from "@/actions/student/gamification.actions"
import { CourseList } from "./components/course-list"
import { GamificationWidget } from "./components/gamification-widget"

export default async function StudentDashboard() {
  // Llamar server actions en paralelo
  const [coursesResult, gamificationResult] = await Promise.all([
    getEnrolledCourses({}),
    getGamificationProfile({})
  ])

  if (!coursesResult.success) {
    return <ErrorDisplay error={coursesResult.error} />
  }

  return (
    <div className="space-y-6">
      <CourseList courses={coursesResult.data} />

      {gamificationResult.success && (
        <GamificationWidget profile={gamificationResult.data} />
      )}
    </div>
  )
}
```

### 4. Uso en Client Components (con useTransition)

```typescript
// src/app/(plataforma)/estudiante/cursos/[id]/components/enroll-button.tsx
"use client"

import { useTransition } from "react"
import { enrollInCourse } from "@/actions/student/enrollment.actions"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

export function EnrollButton({ courseId }: { courseId: string }) {
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()
  const router = useRouter()

  const handleEnroll = () => {
    startTransition(async () => {
      const result = await enrollInCourse({ courseId })

      if (result.success) {
        toast({
          title: "Inscripción exitosa",
          description: "Te has inscrito al curso correctamente"
        })
        router.refresh() // Revalidar server components
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive"
        })
      }
    })
  }

  return (
    <Button onClick={handleEnroll} disabled={isPending}>
      {isPending ? "Inscribiendo..." : "Inscribirse"}
    </Button>
  )
}
```

## Migración de Patterns Existentes

### Pattern 1: Direct Repository → Server Action

**ANTES (Incorrecto):**
```typescript
// page.tsx
import { studentRepository } from "@/database/repositories/student.repository"

export default async function Page() {
  const courses = await studentRepository.getEnrolledCourses(userId)
  return <CourseList courses={courses} />
}
```

**DESPUÉS (Correcto):**
```typescript
// page.tsx
import { getEnrolledCourses } from "@/actions/student/enrollment.actions"

export default async function Page() {
  const result = await getEnrolledCourses({})

  if (!result.success) {
    return <ErrorDisplay error={result.error} />
  }

  return <CourseList courses={result.data} />
}
```

### Pattern 2: Database Context → Server Action

**ANTES (Incorrecto):**
```typescript
// database/contexts/student.ts
"use server"

export async function getStudentDashboard(userId: string) {
  return await prisma.enrollment.findMany({
    where: { studentId: userId }
  })
}
```

**DESPUÉS (Correcto):**
```typescript
// actions/student/enrollment.actions.ts
"use server"

export const getEnrolledCourses = createAction({
  name: "student.getEnrolledCourses",
  requireAuth: true,
  allowedRoles: ["STUDENT"],
  execute: async (input, context) => {
    const useCase = container.get<GetEnrolledCoursesUseCase>(
      TOKENS.GET_ENROLLED_COURSES
    )
    return await useCase.execute({ studentId: context.userId })
  }
})
```

## Ventajas de Esta Arquitectura

1. **Type Safety**: Zod + TypeScript garantizan tipos seguros end-to-end
2. **Validación Centralizada**: Sesión y permisos en un solo lugar
3. **Testeable**: Actions pequeñas y aisladas, fáciles de testear
4. **DRY**: Reutilización de lógica común (auth, validation, error handling)
5. **Escalable**: Fácil agregar nuevas actions siguiendo el mismo patrón
6. **Clean Architecture**: Respeta la separación de capas
7. **Error Handling**: Result pattern garantiza manejo consistente
8. **Developer Experience**: Autocompletado y errores en tiempo de desarrollo

## Convenciones de Nomenclatura

- **Actions**: `{verbo}{Entidad}` - `getEnrolledCourses`, `createCourse`, `updateProgress`
- **Archivos**: `{entidad}.actions.ts` - `enrollment.actions.ts`, `course.actions.ts`
- **Schemas**: `{accion}Schema` - `enrollSchema`, `createCourseSchema`
- **Carpetas**: Por rol o dominio - `student/`, `instructor/`, `admin/`

## Testing Strategy

```typescript
// __tests__/actions/student/enrollment.actions.test.ts
import { enrollInCourse } from "@/actions/student/enrollment.actions"
import { prismaMock } from "@/test/prisma-mock"

jest.mock("@/lib/auth", () => ({
  getServerSession: jest.fn().mockResolvedValue({
    user: { id: "user-1", role: "STUDENT" }
  })
}))

describe("enrollInCourse", () => {
  it("should enroll student in course", async () => {
    const result = await enrollInCourse({ courseId: "course-1" })

    expect(result.success).toBe(true)
    expect(result.data).toHaveProperty("enrollmentId")
  })

  it("should fail if course is full", async () => {
    const result = await enrollInCourse({ courseId: "full-course" })

    expect(result.success).toBe(false)
    expect(result.error).toContain("curso lleno")
  })
})
```

## Checklist de Migración

- [ ] Crear action builder en `_shared/action-builder.ts`
- [ ] Migrar database contexts a actions
- [ ] Centralizar actions co-localizadas
- [ ] Actualizar todas las pages para usar actions
- [ ] Eliminar imports directos de repositorios en pages
- [ ] Agregar validación Zod a todas las actions
- [ ] Implementar Result pattern consistentemente
- [ ] Crear barrel exports en cada carpeta
- [ ] Documentar cada action con JSDoc
- [ ] Agregar tests unitarios
