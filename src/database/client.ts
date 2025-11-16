import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

const prismaBase = globalForPrisma.prisma ?? new PrismaClient()

export const prisma = prismaBase.$extends({
  query: {
    $allModels: {
      async $allOperations({ args, query }) {
        const result = await query(args)
        return parseDecimals(result)
      }
    }
  }
})

if (!globalForPrisma.prisma) globalForPrisma.prisma = prismaBase

function parseDecimals(value: unknown): unknown {
  if (value === null || value === undefined) return value
  if (Array.isArray(value)) return value.map(parseDecimals)
  if (typeof value !== 'object') return value

  const obj = value as Record<string, unknown>
  if (typeof obj.toNumber === 'function' || (typeof obj.toString === 'function' && obj.constructor?.name === 'Decimal')) {
    try {
      const str = obj.toString()
      const num = Number(str)
      return Number.isFinite(num) ? num : str
    } catch {
      return obj.toString()
    }
  }

  const out: Record<string, unknown> = {}
  for (const key of Object.keys(obj)) out[key] = parseDecimals(obj[key])
  return out
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w-]+/g, '') // Remove all non-word chars
    .replace(/--+/g, '-') // Replace multiple - with single -
}
