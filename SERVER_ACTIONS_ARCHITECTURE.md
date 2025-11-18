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
} catch (error) {
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
