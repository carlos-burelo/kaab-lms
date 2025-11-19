/**
 * Enrollment Repository Implementation
 */

import { eventBus } from '@/core/infrastructure/event-bus'
import { DatabaseError } from '@/core/shared/errors'
import { Result } from '@/core/shared/result'
import { prisma } from '@/lib/prisma'
import type { Enrollment } from '../domain/enrollment.entity'
import type { IEnrollmentRepository } from '../domain/enrollment.repository.interface'
import { enrollmentMapper } from './enrollment.mapper'

export class EnrollmentRepository implements IEnrollmentRepository {
  async findById(id: string): Promise<Result<Enrollment | null>> {
    try {
      const enrollment = await prisma.enrollment.findUnique({
        where: { id }
      })

      if (!enrollment) return Result.ok(null)

      return Result.ok(enrollmentMapper.toDomain(enrollment))
    } catch (_error) {
      return Result.fail(new DatabaseError('Failed to find enrollment', _error as Error))
    }
  }

  async findByUserAndCourse(userId: string, courseId: string): Promise<Result<Enrollment | null>> {
    try {
      const enrollment = await prisma.enrollment.findFirst({
        where: {
          userId,
          courseId
        }
      })

      if (!enrollment) return Result.ok(null)

      return Result.ok(enrollmentMapper.toDomain(enrollment))
    } catch (_error) {
      return Result.fail(new DatabaseError('Failed to find enrollment by user and course', _error as Error))
    }
  }

  async findByUser(userId: string): Promise<Result<Enrollment[]>> {
    try {
      const enrollments = await prisma.enrollment.findMany({
        where: { userId },
        orderBy: {
          createdAt: 'desc'
        }
      })

      return Result.ok(enrollments.map(enrollmentMapper.toDomain))
    } catch (_error) {
      return Result.fail(new DatabaseError('Failed to find enrollments by user', _error as Error))
    }
  }

  async findByCourse(courseId: string): Promise<Result<Enrollment[]>> {
    try {
      const enrollments = await prisma.enrollment.findMany({
        where: { courseId },
        orderBy: {
          createdAt: 'desc'
        }
      })

      return Result.ok(enrollments.map(enrollmentMapper.toDomain))
    } catch (_error) {
      return Result.fail(new DatabaseError('Failed to find enrollments by course', _error as Error))
    }
  }

  async save(entity: Enrollment): Promise<Result<Enrollment>> {
    try {
      const model = enrollmentMapper.toPersistence(entity)

      const saved = await prisma.enrollment.upsert({
        where: { id: entity.id },
        create: model,
        update: model
      })

      // Publish domain events
      for (const event of entity.domainEvents) {
        await eventBus.publish(event)
      }
      entity.clearEvents()

      return Result.ok(enrollmentMapper.toDomain(saved))
    } catch (_error) {
      return Result.fail(new DatabaseError('Failed to save enrollment', _error as Error))
    }
  }

  async delete(id: string): Promise<Result<void>> {
    try {
      await prisma.enrollment.delete({
        where: { id }
      })

      return Result.ok(undefined)
    } catch (_error) {
      return Result.fail(new DatabaseError('Failed to delete enrollment', _error as Error))
    }
  }

  async exists(id: string): Promise<Result<boolean>> {
    try {
      const count = await prisma.enrollment.count({
        where: { id }
      })

      return Result.ok(count > 0)
    } catch (_error) {
      return Result.fail(new DatabaseError('Failed to check enrollment existence', _error as Error))
    }
  }

  async isUserEnrolled(userId: string, courseId: string): Promise<Result<boolean>> {
    try {
      const count = await prisma.enrollment.count({
        where: {
          userId,
          courseId
        }
      })

      return Result.ok(count > 0)
    } catch (_error) {
      return Result.fail(new DatabaseError('Failed to check user enrollment', _error as Error))
    }
  }

  async getCourseStats(courseId: string): Promise<
    Result<{
      totalEnrollments: number
      completedEnrollments: number
      averageProgress: number
      averageTimeMinutes: number
    }>
  > {
    try {
      const enrollments = await prisma.enrollment.findMany({
        where: { courseId },
        select: {
          progress: true,
          isCompleted: true,
          totalTimeMinutes: true
        }
      })

      const totalEnrollments = enrollments.length

      if (totalEnrollments === 0) {
        return Result.ok({
          totalEnrollments: 0,
          completedEnrollments: 0,
          averageProgress: 0,
          averageTimeMinutes: 0
        })
      }

      const completedEnrollments = enrollments.filter((e) => e.isCompleted).length

      const totalProgress = enrollments.reduce((sum, e) => sum + Number(e.progress), 0)
      const averageProgress = totalProgress / totalEnrollments

      const totalTime = enrollments.reduce((sum, e) => sum + e.totalTimeMinutes, 0)
      const averageTimeMinutes = totalTime / totalEnrollments

      return Result.ok({
        totalEnrollments,
        completedEnrollments,
        averageProgress,
        averageTimeMinutes
      })
    } catch (_error) {
      return Result.fail(new DatabaseError('Failed to get course stats', _error as Error))
    }
  }

  async getUserStats(userId: string): Promise<
    Result<{
      totalEnrollments: number
      completedCourses: number
      totalTimeMinutes: number
      averageProgress: number
    }>
  > {
    try {
      const enrollments = await prisma.enrollment.findMany({
        where: { userId },
        select: {
          progress: true,
          isCompleted: true,
          totalTimeMinutes: true
        }
      })

      const totalEnrollments = enrollments.length

      if (totalEnrollments === 0) {
        return Result.ok({
          totalEnrollments: 0,
          completedCourses: 0,
          totalTimeMinutes: 0,
          averageProgress: 0
        })
      }

      const completedCourses = enrollments.filter((e) => e.isCompleted).length

      const totalTimeMinutes = enrollments.reduce((sum, e) => sum + e.totalTimeMinutes, 0)

      const totalProgress = enrollments.reduce((sum, e) => sum + Number(e.progress), 0)
      const averageProgress = totalProgress / totalEnrollments

      return Result.ok({
        totalEnrollments,
        completedCourses,
        totalTimeMinutes,
        averageProgress
      })
    } catch (_error) {
      return Result.fail(new DatabaseError('Failed to get user stats', _error as Error))
    }
  }
}
