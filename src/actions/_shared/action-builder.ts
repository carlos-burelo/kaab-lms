import { z } from "zod"
import { getServerSession } from "@/lib/auth"
import { Result } from "@/core/shared/result"
import type { Session } from "next-auth"

/**
 * Resultado estandarizado para todas las Server Actions
 */
export type ActionResult<T> = Promise<{
  success: boolean
  data?: T
  error?: string
}>

/**
 * Contexto de ejecución con información de sesión y usuario
 */
export type ActionContext = {
  userId: string
  userRole: string
  session: Session
}

/**
 * Configuración para crear una Server Action type-safe
 */
export type ActionConfig<TInput, TOutput> = {
  /** Nombre de la action para logs y debugging */
  name: string
  /** Schema de Zod para validar el input (opcional) */
  schema?: z.ZodSchema<TInput>
  /** Requiere autenticación (default: true) */
  requireAuth?: boolean
  /** Roles permitidos para ejecutar esta action */
  allowedRoles?: string[]
  /** Función que ejecuta el use case */
  execute: (input: TInput, context: ActionContext) => Promise<Result<TOutput, Error>>
}

/**
 * Helper para crear Server Actions type-safe con validación, autenticación y manejo de errores
 *
 * @example
 * ```typescript
 * export const getEnrolledCourses = createAction({
 *   name: "student.getEnrolledCourses",
 *   requireAuth: true,
 *   allowedRoles: ["STUDENT"],
 *   execute: async (input, context) => {
 *     const useCase = container.get<GetEnrolledCoursesUseCase>(TOKENS.GET_ENROLLED_COURSES)
 *     return await useCase.execute({ studentId: context.userId })
 *   }
 * })
 * ```
 */
export const createAction = <TInput, TOutput>(
  config: ActionConfig<TInput, TOutput>
) => {
  return async (input: TInput): ActionResult<TOutput> => {
    try {
      // 1. Validar autenticación si es requerida
      if (config.requireAuth !== false) {
        const user = await getServerSession()

        if (!user) {
          return {
            success: false,
            error: "No autorizado. Debes iniciar sesión."
          }
        }

        // 2. Validar roles permitidos
        if (config.allowedRoles && config.allowedRoles.length > 0) {
          if (!config.allowedRoles.includes(user.role)) {
            return {
              success: false,
              error: "No tienes permisos para realizar esta acción."
            }
          }
        }

        // 3. Validar input con Zod si se proporciona schema
        if (config.schema) {
          const validation = config.schema.safeParse(input)
          if (!validation.success) {
            const firstError = validation.error.issues[0]
            return {
              success: false,
              error: firstError.message
            }
          }
        }

        // 4. Construir contexto
        const context: ActionContext = {
          userId: user.id,
          userRole: user.role,
          session: { user } as Session
        }

        // 5. Ejecutar use case
        const result = await config.execute(input, context)

        // 6. Convertir Result a ActionResult
        if (result.isSuccess) {
          return { success: true, data: result.value }
        }
        return { success: false, error: result.error.message }
      }

      // Actions públicas (sin autenticación)
      const result = await config.execute(input, {} as ActionContext)

      if (result.isSuccess) {
        return { success: true, data: result.value }
      }
      return { success: false, error: result.error.message }

    } catch (error) {
      // Log del error para debugging
      console.error(`[Action Error: ${config.name}]`, error)

      // Retornar error user-friendly
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido al procesar la solicitud."
      }
    }
  }
}

/**
 * Helper para crear actions públicas (sin autenticación)
 */
export const createPublicAction = <TInput, TOutput>(
  config: Omit<ActionConfig<TInput, TOutput>, "requireAuth" | "allowedRoles">
) => {
  return createAction({
    ...config,
    requireAuth: false,
    allowedRoles: []
  })
}

/**
 * Helper para crear actions que solo requieren autenticación (sin restricción de roles)
 */
export const createAuthenticatedAction = <TInput, TOutput>(
  config: Omit<ActionConfig<TInput, TOutput>, "requireAuth" | "allowedRoles">
) => {
  return createAction({
    ...config,
    requireAuth: true,
    allowedRoles: []
  })
}
