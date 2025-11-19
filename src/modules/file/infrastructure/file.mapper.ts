/**
 * File Mapper
 */

import type { File as PrismaFile } from '@prisma/client'
import type { Mapper } from '@/core/shared/mapper.interface'
import { File, type FileProps } from '../domain/file.entity'

export interface FileDTO {
  id: string
  filename: string
  originalFilename: string
  mimeType: string
  size: number
  path: string
  url: string
  uploadedBy: string
  isPublic: boolean
  tags: string[]
  metadata?: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

class FileMapper implements Mapper<File, PrismaFile, FileDTO> {
  toDomain(raw: PrismaFile): File {
    const props: FileProps = {
      filename: raw.filename,
      originalFilename: raw.originalFilename,
      mimeType: raw.mimeType,
      size: raw.size,
      path: raw.path,
      url: raw.url,
      uploadedBy: raw.uploadedBy,
      isPublic: raw.isPublic,
      tags: raw.tags,
      metadata: raw.metadata as Record<string, any> | undefined,
      id: raw.id,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt
    }

    // Use factory method instead of direct instantiation
    const result = File.create(props)
    if (result.isFailure) {
      throw new Error(`Failed to create File entity: ${result.error.message}`)
    }

    return result.value
  }

  toPersistence(entity: File): Omit<PrismaFile, 'createdAt' | 'updatedAt'> {
    return {
      id: entity.id,
      filename: entity.filename,
      originalFilename: entity.originalFilename,
      mimeType: entity.mimeType,
      size: entity.size,
      path: entity.path,
      url: entity.url,
      uploadedBy: entity.uploadedBy,
      isPublic: entity.isPublic,
      tags: entity.tags,
      metadata: entity.metadata || null
    }
  }

  toDTO(entity: File): FileDTO {
    return {
      id: entity.id,
      filename: entity.filename,
      originalFilename: entity.originalFilename,
      mimeType: entity.mimeType,
      size: entity.size,
      path: entity.path,
      url: entity.url,
      uploadedBy: entity.uploadedBy,
      isPublic: entity.isPublic,
      tags: entity.tags,
      metadata: entity.metadata,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt
    }
  }
}

export const fileMapper = new FileMapper()
