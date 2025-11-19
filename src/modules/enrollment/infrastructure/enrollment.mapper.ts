/**
 * Enrollment Mapper
 */

import type { Enrollment as PrismaEnrollment } from '@prisma/client'
import type { Mapper } from '@/core/shared/mapper.interface'
import { Enrollment, type EnrollmentProps } from '../domain/enrollment.entity'

export interface EnrollmentDTO {
  id: string
  userId: string
  courseId: string
  progress: number
  lastLessonId?: string
  lastAccessed?: Date
  totalTimeMinutes: number
  isCompleted: boolean
  completedAt?: Date
  createdAt: Date
  updatedAt: Date
}

class EnrollmentMapper implements Mapper<Enrollment, PrismaEnrollment, EnrollmentDTO> {
  toDomain(raw: PrismaEnrollment): Enrollment {
    const props: EnrollmentProps = {
      userId: raw.userId,
      courseId: raw.courseId,
      progress: Number(raw.progress),
      lastLessonId: raw.lastLessonId || undefined,
      lastAccessed: raw.lastAccessed || undefined,
      totalTimeMinutes: raw.totalTimeMinutes,
      isCompleted: raw.isCompleted,
      completedAt: raw.completedAt || undefined,
      id: raw.id,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt
    }

    // Use factory method instead of direct instantiation
    const result = Enrollment.create(props)
    if (result.isFailure) {
      throw new Error(`Failed to create Enrollment entity: ${result.error.message}`)
    }

    return result.value
  }

  toPersistence(entity: Enrollment): Omit<PrismaEnrollment, 'createdAt' | 'updatedAt'> {
    return {
      id: entity.id,
      userId: entity.userId,
      courseId: entity.courseId,
      progress: entity.progress,
      lastLessonId: entity.lastLessonId || null,
      lastAccessed: entity.lastAccessed || null,
      totalTimeMinutes: entity.totalTimeMinutes,
      isCompleted: entity.isCompleted,
      completedAt: entity.completedAt || null
    }
  }

  toDTO(entity: Enrollment): EnrollmentDTO {
    return {
      id: entity.id,
      userId: entity.userId,
      courseId: entity.courseId,
      progress: entity.progress,
      lastLessonId: entity.lastLessonId,
      lastAccessed: entity.lastAccessed,
      totalTimeMinutes: entity.totalTimeMinutes,
      isCompleted: entity.isCompleted,
      completedAt: entity.completedAt,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt
    }
  }
}

export const enrollmentMapper = new EnrollmentMapper()
