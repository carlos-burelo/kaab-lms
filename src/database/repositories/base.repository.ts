/**
 * Base Repository Pattern
 * Proporciona métodos comunes para todas las operaciones CRUD
 */
import { Prisma } from '@prisma/client'
import { prisma } from '@/database/client'

export abstract class BaseRepository {
  protected client = prisma

  /**
   * Maneja errores comunes de prisma
   */
  protected handleError(error: any, context: string) {
    console.error(`[${context}] Error:`, error)

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new Error(`Registro duplicado: ${error.meta?.target}`)
      }
      if (error.code === 'P2025') {
        throw new Error('Registro no encontrado')
      }
    }

    throw error
  }
}
