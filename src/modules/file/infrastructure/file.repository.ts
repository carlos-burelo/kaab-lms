/**
 * File Repository Implementation
 */

import { eventBus } from '@/core/infrastructure/event-bus'
import { DatabaseError } from '@/core/shared/errors'
import { Result } from '@/core/shared/result'
import { prisma } from '@/lib/prisma'
import type { File } from '../domain/file.entity'
import type { IFileRepository, SearchFilesOptions } from '../domain/file.repository.interface'
import { fileMapper } from './file.mapper'

export class FileRepository implements IFileRepository {
  async findById(id: string): Promise<Result<File | null>> {
    try {
      const file = await prisma.file.findUnique({
        where: { id }
      })

      if (!file) return Result.ok(null)

      return Result.ok(fileMapper.toDomain(file))
    } catch (_error) {
      return Result.fail(new DatabaseError('Failed to find file', _error as Error))
    }
  }

  async findByUploader(userId: string): Promise<Result<File[]>> {
    try {
      const files = await prisma.file.findMany({
        where: { uploadedBy: userId },
        orderBy: { createdAt: 'desc' }
      })

      return Result.ok(files.map((file) => fileMapper.toDomain(file)))
    } catch (_error) {
      return Result.fail(new DatabaseError('Failed to find files by uploader', _error as Error))
    }
  }

  async findPublicFiles(limit: number = 50, offset: number = 0): Promise<Result<File[]>> {
    try {
      const files = await prisma.file.findMany({
        where: { isPublic: true },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset
      })

      return Result.ok(files.map((file) => fileMapper.toDomain(file)))
    } catch (_error) {
      return Result.fail(new DatabaseError('Failed to find public files', _error as Error))
    }
  }

  async findByTags(tags: string[]): Promise<Result<File[]>> {
    try {
      const files = await prisma.file.findMany({
        where: {
          tags: {
            hasSome: tags
          }
        },
        orderBy: { createdAt: 'desc' }
      })

      return Result.ok(files.map((file) => fileMapper.toDomain(file)))
    } catch (_error) {
      return Result.fail(new DatabaseError('Failed to find files by tags', _error as Error))
    }
  }

  async search(options: SearchFilesOptions): Promise<Result<File[]>> {
    try {
      const where: any = {}

      if (options.uploadedBy) {
        where.uploadedBy = options.uploadedBy
      }

      if (options.isPublic !== undefined) {
        where.isPublic = options.isPublic
      }

      if (options.tags && options.tags.length > 0) {
        where.tags = {
          hasSome: options.tags
        }
      }

      if (options.mimeType) {
        where.mimeType = options.mimeType
      }

      const files = await prisma.file.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: options.limit || 50,
        skip: options.offset || 0
      })

      return Result.ok(files.map((file) => fileMapper.toDomain(file)))
    } catch (_error) {
      return Result.fail(new DatabaseError('Failed to search files', _error as Error))
    }
  }

  async save(entity: File): Promise<Result<File>> {
    try {
      const model = fileMapper.toPersistence(entity)

      const saved = await prisma.file.upsert({
        where: { id: entity.id },
        create: model,
        update: model
      })

      // Publish domain events
      for (const event of entity.domainEvents) {
        await eventBus.publish(event)
      }
      entity.clearEvents()

      return Result.ok(fileMapper.toDomain(saved))
    } catch (_error) {
      return Result.fail(new DatabaseError('Failed to save file', _error as Error))
    }
  }

  async delete(id: string): Promise<Result<void>> {
    try {
      await prisma.file.delete({
        where: { id }
      })

      return Result.ok(undefined)
    } catch (_error) {
      return Result.fail(new DatabaseError('Failed to delete file', _error as Error))
    }
  }

  async exists(id: string): Promise<Result<boolean>> {
    try {
      const count = await prisma.file.count({
        where: { id }
      })

      return Result.ok(count > 0)
    } catch (_error) {
      return Result.fail(new DatabaseError('Failed to check file existence', _error as Error))
    }
  }

  async countByUploader(userId: string): Promise<Result<number>> {
    try {
      const count = await prisma.file.count({
        where: { uploadedBy: userId }
      })

      return Result.ok(count)
    } catch (_error) {
      return Result.fail(new DatabaseError('Failed to count files by uploader', _error as Error))
    }
  }

  async getTotalStorageByUploader(userId: string): Promise<Result<number>> {
    try {
      const result = await prisma.file.aggregate({
        where: { uploadedBy: userId },
        _sum: {
          size: true
        }
      })

      return Result.ok(result._sum.size || 0)
    } catch (_error) {
      return Result.fail(new DatabaseError('Failed to get total storage by uploader', _error as Error))
    }
  }
}
