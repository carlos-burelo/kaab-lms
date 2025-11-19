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

    } catch (_error)  {
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
=======
# Server Actions Architecture - Guía de Migración

## Resumen

Este documento describe la arquitectura de Server Actions siguiendo los principios de Clean Architecture con DDD para el proyecto KAAB LMS.

## Principios de Arquitectura

### 1. Flujo de Arquitectura Correcto

```
┌─────────────────────────────────────────────────────────┐
│         Presentation Layer (Server Actions)             │
│         src/actions/*.actions.ts                        │
└───────────────────┬─────────────────────────────────────┘
                    │ getUseCase()
                    ▼
┌─────────────────────────────────────────────────────────┐
│         Application Layer (Use Cases)                   │
│         src/modules/{module}/application/use-cases/     │
└───────────────────┬─────────────────────────────────────┘
                    │ Repository Interface
                    ▼
┌─────────────────────────────────────────────────────────┐
│         Infrastructure Layer (Repositories)             │
│         src/modules/{module}/infrastructure/            │
└───────────────────┬─────────────────────────────────────┘
                    │ Prisma
                    ▼
                 Database
```

### 2. Patrón de Server Actions

**ANTES (Incorrecto):**
```typescript
// ❌ Server Action llamando directamente a Repository
'use server'
import { courseRepository } from '@/database/repositories'

export async function createCourse(data: unknown) {
  const validated = CreateCourseSchema.parse(data)
  const course = await courseRepository.create(validated)
  return { success: true, data: course }
}
```

**DESPUÉS (Correcto):**
```typescript
// ✅ Server Action llamando a Use Case
'use server'
import { getUseCase } from '@/core/infrastructure'
import { TOKENS } from '@/core/infrastructure/dependency-injection'
import type { CreateCourseUseCase } from '@/modules/course/application/use-cases'
import { CreateCourseSchema } from '@/modules/course/application/dtos'

export async function createCourse(data: unknown) {
  const session = await getSession()
  if (!session?.id) {
    return { success: false, error: 'No autenticado' }
  }

  // 1. Validate input
  const validated = CreateCourseSchema.parse(data)

  // 2. Get use case from DI container
  const useCase = getUseCase<CreateCourseUseCase>(
    TOKENS.CREATE_COURSE_USE_CASE
  )

  // 3. Execute use case
  const result = await useCase.execute({
    dto: validated,
    currentUserId: session.id,
  })

  // 4. Handle result with Result pattern
  if (result.isFailure) {
    return {
      success: false,
      error: result.error.message,
      code: result.error.code,
    }
  }

  // 5. Revalidate and return
  revalidatePath('/instructor/cursos')
  return { success: true, data: result.value }
}
```

## Componentes de la Arquitectura

### 1. DTOs (Data Transfer Objects)

Ubicación: `src/modules/{module}/application/dtos/`

```typescript
// src/modules/assignment/application/dtos/create-assignment.dto.ts
import { z } from 'zod'

export const CreateAssignmentSchema = z.object({
  lessonId: z.string().min(1, 'El ID de la lección es requerido'),
  courseId: z.string().min(1, 'El ID del curso es requerido'),
  title: z.string().min(3, 'Mínimo 3 caracteres'),
  description: z.string().optional(),
  dueDate: z.coerce.date(),
  maxScore: z.number().positive(),
})

export type CreateAssignmentDTO = z.infer<typeof CreateAssignmentSchema>
```

### 2. Use Cases

Ubicación: `src/modules/{module}/application/use-cases/`

```typescript
// src/modules/assignment/application/use-cases/create-assignment.use-case.ts
import { BaseUseCase } from '@/core/shared/use-case.interface'
import { Result } from '@/core/shared/result'

interface CreateAssignmentRequest {
  dto: CreateAssignmentDTO
  currentUserId: string
}

export class CreateAssignmentUseCase extends BaseUseCase<
  CreateAssignmentRequest,
  AssignmentDTO
> {
  constructor(private assignmentRepository: IAssignmentRepository) {
    super()
  }

  async execute(request: CreateAssignmentRequest): Promise<Result<AssignmentDTO>> {
    const { dto } = request

    // 1. Create domain entity
    const assignmentResult = Assignment.create(dto)
    if (assignmentResult.isFailure) {
      return Result.fail(assignmentResult.error)
    }

    // 2. Save via repository
    const savedResult = await this.assignmentRepository.save(assignmentResult.value)
    if (savedResult.isFailure) {
      return Result.fail(savedResult.error)
    }

    // 3. Map to DTO and return
    return Result.ok(assignmentMapper.toDTO(savedResult.value))
  }
}
```

### 3. Dependency Injection

Los use cases se registran en el contenedor DI:

```typescript
// src/core/infrastructure/container.config.ts
container.register(
  TOKENS.CREATE_ASSIGNMENT_USE_CASE,
  () => new CreateAssignmentUseCase(
    container.resolve(TOKENS.ASSIGNMENT_REPOSITORY)
  )
)
```

### 4. Helper getUseCase

```typescript
// src/core/infrastructure/index.ts
export function getUseCase<T>(token: string | symbol): T {
  return container.resolve<T>(token)
}
```

## Estado Actual del Proyecto

### ✅ Completado

1. **Core Infrastructure:**
   - ✅ Result Pattern implementado
   - ✅ Error classes (ValidationError, BusinessRuleError, etc.)
   - ✅ DI Container configurado
   - ✅ Event Bus implementado
   - ✅ Helper `getUseCase()` creado

2. **Módulos con Use Cases:**
   - ✅ Course (create, update, publish, get)
   - ✅ Quiz (create, update, delete, get)
   - ✅ Assignment (create, update, delete, get, submit, grade) - DTOs actualizados
   - ✅ Enrollment (enroll, update progress, complete)
   - ✅ Notification (create, mark as read, get)
   - ✅ Message (send, get conversations)
   - ✅ Learning Path (create, update, navigate)
   - ✅ Gamification (badges, achievements, missions, XP, coins)
   - ✅ Productivity (tasks, calendar events)
   - ✅ File (upload, get, update, delete, search)

### 🔄 En Progreso

1. **Server Actions a Migrar:**
   - 🔄 assignment.actions.ts - DTOs y entities actualizados, falta completar migración
   - ❌ quiz.actions.ts
   - ❌ course.actions.ts (parcialmente usa repositorios directos)
   - ❌ instructor.actions.ts (usa repositorios directos)

2. **Actions Co-localizadas a Consolidar:**
   - ❌ src/app/(plataforma)/instructor/estudiantes/actions.ts → src/actions/student.actions.ts
   - ❌ src/app/(plataforma)/instructor/certificados/actions.ts → src/actions/certificate.actions.ts
   - ❌ src/app/(plataforma)/instructor/rutas-aprendizaje/actions.ts (ya usa repositorios)

3. **Use Cases Faltantes:**
   - ❌ GetAssignmentSubmissionsUseCase
   - ❌ GetStudentAssignmentSubmissionsUseCase
   - ❌ GetInstructorStatsUseCase
   - ❌ GetCourseAnalyticsUseCase
   - ❌ GetEnrollmentTrendUseCase
   - ❌ GetRevenueDataUseCase
   - ❌ CertificateRepository y Use Cases

## Guía de Migración Paso a Paso

### Paso 1: Verificar que existan Use Cases

```bash
# Buscar use cases existentes
ls src/modules/{module}/application/use-cases/
```

### Paso 2: Verificar que estén registrados en el DI Container

```typescript
// Verificar en src/core/infrastructure/container.config.ts
// y src/core/infrastructure/dependency-injection.ts (TOKENS)
```

### Paso 3: Actualizar DTOs si es necesario

Los DTOs deben reflejar todos los campos necesarios para la aplicación.

### Paso 4: Actualizar Entities y Mappers

Asegurar que los entities y mappers soporten los nuevos campos.

### Paso 5: Migrar Server Action

Reemplazar llamadas a repositorios con llamadas a use cases usando `getUseCase()`.

### Paso 6: Testing

Probar que las server actions funcionen correctamente con los use cases.

## Ejemplos de Uso Detallados

### Ejemplo 1: Create Operation

```typescript
'use server'
export async function createAssignment(data: unknown) {
  const session = await getSession()
  if (!session?.id) {
    return { success: false, error: 'No autenticado' }
  }

  const validated = CreateAssignmentSchema.parse(data)
  const useCase = getUseCase<CreateAssignmentUseCase>(TOKENS.CREATE_ASSIGNMENT_USE_CASE)

  const result = await useCase.execute({
    dto: validated,
    currentUserId: session.id,
  })

  if (result.isFailure) {
    return { success: false, error: result.error.message }
  }

  revalidatePath('/instructor/cursos')
  return { success: true, data: result.value }
}
```

### Ejemplo 2: Update Operation

```typescript
'use server'
export async function updateAssignment(id: string, data: unknown) {
  const session = await getSession()
  if (!session?.id) {
    return { success: false, error: 'No autenticado' }
  }

  const validated = UpdateAssignmentSchema.parse({ id, ...data })
  const useCase = getUseCase<UpdateAssignmentUseCase>(TOKENS.UPDATE_ASSIGNMENT_USE_CASE)

  const result = await useCase.execute({
    dto: validated,
    currentUserId: session.id,
  })

  if (result.isFailure) {
    return { success: false, error: result.error.message }
  }

  revalidatePath('/instructor/cursos')
  return { success: true, data: result.value }
}
```

### Ejemplo 3: Delete Operation

```typescript
'use server'
export async function deleteAssignment(id: string) {
  const session = await getSession()
  if (!session?.id) {
    return { success: false, error: 'No autenticado' }
  }

  const useCase = getUseCase<DeleteAssignmentUseCase>(TOKENS.DELETE_ASSIGNMENT_USE_CASE)

  const result = await useCase.execute({
    assignmentId: id,
    currentUserId: session.id,
  })

  if (result.isFailure) {
    return { success: false, error: result.error.message }
  }

  revalidatePath('/instructor/cursos')
  return { success: true }
}
```

## Estrategias de Testing

### 1. Unit Tests para Use Cases

```typescript
describe('CreateAssignmentUseCase', () => {
  it('should create assignment successfully', async () => {
    const mockRepo = {
      save: jest.fn().mockResolvedValue(Result.ok(mockAssignment))
    }

    const useCase = new CreateAssignmentUseCase(mockRepo)
    const result = await useCase.execute({
      dto: { title: 'Test', lessonId: '1', maxScore: 100 },
      currentUserId: 'user1'
    })

    expect(result.isSuccess).toBe(true)
    expect(mockRepo.save).toHaveBeenCalled()
  })
})
```

### 2. Integration Tests para Server Actions

```typescript
describe('createAssignment action', () => {
  it('should create assignment via use case', async () => {
    const data = {
      title: 'Test Assignment',
      lessonId: 'lesson-1',
      courseId: 'course-1',
      maxScore: 100
    }

    const result = await createAssignment(data)

    expect(result.success).toBe(true)
    expect(result.data).toHaveProperty('id')
  })
})
```

## Best Practices

### 1. Siempre usar Result Pattern

```typescript
// ✅ Correcto
const result = await useCase.execute(request)
if (result.isFailure) {
  return { success: false, error: result.error.message }
}
return { success: true, data: result.value }

// ❌ Incorrecto
try {
  const data = await useCase.execute(request)
  return { success: true, data }
} catch (_error)  {
  return { success: false, error }
}
```

### 2. Validar entrada con Zod

```typescript
// ✅ Correcto
const validated = CreateAssignmentSchema.parse(data)

// ❌ Incorrecto
const { title, lessonId } = data as CreateAssignmentDTO
```

### 3. Usar Type-safe Use Cases

```typescript
// ✅ Correcto
const useCase = getUseCase<CreateAssignmentUseCase>(TOKENS.CREATE_ASSIGNMENT_USE_CASE)

// ❌ Incorrecto
const useCase = getUseCase(TOKENS.CREATE_ASSIGNMENT_USE_CASE) // Sin tipo
```

### 4. Revalidate Paths después de mutaciones

```typescript
// ✅ Correcto
if (result.isSuccess) {
  revalidatePath('/instructor/cursos')
}

// ❌ Incorrecto - No revalidar
return { success: true, data: result.value }
```

## Próximos Pasos

1. ✅ Completar migración de assignment.actions.ts
2. Migrar quiz.actions.ts
3. Consolidar actions co-localizadas
4. Crear use cases faltantes para instructor analytics
5. Migrar instructor/(principal)/page.tsx
6. Documentar patrones adicionales

## Referencias

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Arquitectura general del sistema
- [NEW_ARCHITECTURE_GUIDE.md](./NEW_ARCHITECTURE_GUIDE.md) - Guía de implementación
- [Clean Architecture by Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Domain-Driven Design](https://martinfowler.com/bliki/DomainDrivenDesign.html)
