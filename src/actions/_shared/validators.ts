import { z } from 'zod'

/**
 * Validators comunes reutilizables en múltiples Server Actions
 */

// ============ IDs ============
export const idSchema = z.string().min(1, 'ID requerido')

export const optionalIdSchema = z.string().optional()

// ============ Paginación ============
export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10)
})

export const cursorPaginationSchema = z.object({
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(100).default(10)
})

// ============ Fechas ============
export const dateRangeSchema = z.object({
  startDate: z.date().or(z.string()),
  endDate: z.date().or(z.string())
})

// ============ Búsqueda ============
export const searchSchema = z.object({
  query: z.string().min(1, 'Consulta de búsqueda requerida'),
  filters: z.record(z.string(), z.any()).optional()
})

// ============ Ordenamiento ============
export const sortSchema = z.object({
  field: z.string(),
  order: z.enum(['asc', 'desc']).default('asc')
})

// ============ Archivos ============
export const fileUploadSchema = z.object({
  fileName: z.string().min(1),
  fileType: z.string().min(1),
  fileSize: z.number().positive(),
  fileData: z.string() // Base64 o URL
})

// ============ Course Related ============
export const courseIdSchema = z.object({
  courseId: idSchema
})

export const moduleIdSchema = z.object({
  moduleId: idSchema
})

export const lessonIdSchema = z.object({
  lessonId: idSchema
})

// ============ User Related ============
export const userIdSchema = z.object({
  userId: idSchema
})

export const emailSchema = z.string().email('Email inválido')

export const roleSchema = z.enum(['STUDENT', 'INSTRUCTOR', 'ADMIN'])

// ============ Enrollment Related ============
export const enrollmentIdSchema = z.object({
  enrollmentId: idSchema
})

export const enrollmentSchema = z.object({
  courseId: idSchema,
  studentId: optionalIdSchema // Opcional si se toma del contexto
})

// ============ Progress Related ============
export const progressSchema = z.object({
  enrollmentId: idSchema,
  lessonId: idSchema,
  completed: z.boolean(),
  timeSpent: z.number().int().min(0).optional(),
  score: z.number().min(0).max(100).optional()
})

// ============ Quiz Related ============
export const quizAttemptSchema = z.object({
  quizId: idSchema,
  answers: z.array(
    z.object({
      questionId: idSchema,
      answerId: idSchema.or(z.array(idSchema)), // Múltiple opción o única
      textAnswer: z.string().optional() // Para preguntas abiertas
    })
  )
})

// ============ Assignment Related ============
export const assignmentSubmissionSchema = z.object({
  assignmentId: idSchema,
  content: z.string().min(1, 'Contenido requerido'),
  attachments: z.array(fileUploadSchema).optional()
})

// ============ Common Filters ============
export const courseFiltersSchema = z.object({
  category: z.string().optional(),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  search: z.string().optional()
})

// ============ Validators para FormData ============

/**
 * Convierte FormData a objeto plano
 */
export function formDataToObject(formData: FormData): Record<string, any> {
  const obj: Record<string, any> = {}

  formData.forEach((value, key) => {
    // Manejar arrays (keys que terminan en [])
    if (key.endsWith('[]')) {
      const arrayKey = key.slice(0, -2)
      if (!obj[arrayKey]) {
        obj[arrayKey] = []
      }
      obj[arrayKey].push(value)
    } else {
      obj[key] = value
    }
  })

  return obj
}

/**
 * Valida FormData con un schema de Zod
 */
export function validateFormData<T>(
  formData: FormData,
  schema: z.ZodSchema<T>
): { success: true; data: T } | { success: false; error: string } {
  try {
    const obj = formDataToObject(formData)
    const result = schema.safeParse(obj)

    if (!result.success) {
      return {
        success: false,
        error: result.error.issues[0].message
      }
    }

    return {
      success: true,
      data: result.data
    }
  } catch (_error) {
    return {
      success: false,
      error: _error instanceof Error ? _error.message : 'Error de validación'
    }
  }
}
