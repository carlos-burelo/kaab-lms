import { prisma } from '@/database/client'

interface FileFilters {
  userId?: string
  type?: string
  folder?: string
  isPublic?: boolean
  search?: string
}

interface FileListOptions {
  filters?: FileFilters
  limit?: number
  offset?: number
  sortBy?: 'createdAt' | 'name' | 'sizeInBytes'
  sortOrder?: 'asc' | 'desc'
}

interface FileListResult {
  files: any[]
  total: number
  limit: number
  offset: number
}

export class FileRepository {
  /**
   * Get uploaded files with filters and pagination
   */
  async getUploadedFiles(options: FileListOptions = {}): Promise<FileListResult> {
    const { filters = {}, limit = 50, offset = 0, sortBy = 'createdAt', sortOrder = 'desc' } = options

    const where: any = {}

    if (filters.userId) {
      where.userId = filters.userId
    }

    if (filters.type) {
      where.type = filters.type
    }

    if (filters.folder) {
      where.folder = filters.folder
    }

    if (filters.isPublic !== undefined) {
      where.isPublic = filters.isPublic
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { originalName: { contains: filters.search, mode: 'insensitive' } }
      ]
    }

    const [files, total] = await Promise.all([
      prisma.file.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder
        }
      }),
      prisma.file.count({ where })
    ])

    return {
      files,
      total,
      limit,
      offset
    }
  }

  /**
   * Get a single file by ID
   */
  async getFileById(fileId: string) {
    return prisma.file.findUnique({
      where: { id: fileId }
    })
  }

  /**
   * Get files by folder
   */
  async getFilesByFolder(folder: string, userId?: string) {
    const where: any = { folder }

    if (userId) {
      where.userId = userId
    }

    return prisma.file.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })
  }

  /**
   * Get user's files
   */
  async getUserFiles(userId: string, options: FileListOptions = {}) {
    return this.getUploadedFiles({
      ...options,
      filters: {
        ...options.filters,
        userId
      }
    })
  }

  /**
   * Get file statistics for a user
   */
  async getUserFileStats(userId: string) {
    const files = await prisma.file.findMany({
      where: { userId }
    })

    const stats = {
      totalFiles: files.length,
      totalSizeInBytes: files.reduce((sum, f) => sum + Number(f.sizeInBytes), 0),
      byType: {} as Record<string, number>,
      byFolder: {} as Record<string, number>
    }

    files.forEach((file) => {
      stats.byType[file.type] = (stats.byType[file.type] || 0) + 1
      if (file.folder) {
        stats.byFolder[file.folder] = (stats.byFolder[file.folder] || 0) + 1
      }
    })

    return stats
  }

  /**
   * Delete a file
   */
  async deleteFile(fileId: string) {
    return prisma.file.delete({
      where: { id: fileId }
    })
  }

  /**
   * Update file metadata
   */
  async updateFile(fileId: string, data: any) {
    return prisma.file.update({
      where: { id: fileId },
      data
    })
  }

  /**
   * Make file public/private
   */
  async toggleFilePublic(fileId: string, isPublic: boolean) {
    return this.updateFile(fileId, { isPublic })
  }

  /**
   * Get file types available
   */
  async getAvailableFileTypes(userId?: string) {
    const where = userId ? { userId } : {}

    const types = await prisma.file.findMany({
      where,
      select: { type: true },
      distinct: ['type']
    })

    return types.map((t) => t.type)
  }

  /**
   * Search files
   */
  async searchFiles(query: string, userId?: string, limit: number = 50) {
    const where: any = {
      OR: [{ name: { contains: query, mode: 'insensitive' } }, { originalName: { contains: query, mode: 'insensitive' } }]
    }

    if (userId) {
      where.userId = userId
    }

    return prisma.file.findMany({
      where,
      take: limit,
      orderBy: { createdAt: 'desc' }
    })
  }
}

export const fileRepository = new FileRepository()
