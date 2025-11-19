/**
 * Course Repository Implementation (Adapter)
 * Implements the ICourseRepository interface using Prisma
 */

import { eventBus } from '@/core/infrastructure/event-bus'
import { DatabaseError, EntityNotFoundError } from '@/core/shared/errors'
import { Result } from '@/core/shared/result'
import { prisma } from '@/lib/prisma'
import type { Course } from '../domain/course.entity'
import type { CourseListOptions, CourseListResult, ICourseRepository } from '../domain/course.repository.interface'
import { type CourseMapper, courseMapper } from './course.mapper'

export class CourseRepository implements ICourseRepository {
  constructor(private mapper: CourseMapper = courseMapper) {}

  async findById(id: string): Promise<Result<Course | null>> {
    try {
      const course = await prisma.course.findUnique({
        where: { id }
      })

      if (!course) {
        return Result.ok(null)
      }

      const domainCourse = this.mapper.toDomain(course)
      return Result.ok(domainCourse)
    } catch (_error) {
      return Result.fail(new DatabaseError('Failed to find course by id', _error as Error))
    }
  }

  async findBySlug(slug: string): Promise<Result<Course | null>> {
    try {
      const course = await prisma.course.findUnique({
        where: { slug }
      })

      if (!course) {
        return Result.ok(null)
      }

      const domainCourse = this.mapper.toDomain(course)
      return Result.ok(domainCourse)
    } catch (_error) {
      return Result.fail(new DatabaseError('Failed to find course by slug', _error as Error))
    }
  }

  async save(entity: Course): Promise<Result<Course>> {
    try {
      const persistenceModel = this.mapper.toPersistence(entity)

      const saved = await prisma.course.upsert({
        where: { id: entity.id },
        create: persistenceModel,
        update: persistenceModel
      })

      // Publish domain events
      await this.publishDomainEvents(entity)

      const domainCourse = this.mapper.toDomain(saved)
      return Result.ok(domainCourse)
    } catch (_error) {
      return Result.fail(new DatabaseError('Failed to save course', _error as Error))
    }
  }

  async delete(id: string): Promise<Result<void>> {
    try {
      await prisma.course.delete({
        where: { id }
      })

      return Result.ok(undefined)
    } catch (_error) {
      return Result.fail(new DatabaseError('Failed to delete course', _error as Error))
    }
  }

  async exists(id: string): Promise<Result<boolean>> {
    try {
      const count = await prisma.course.count({
        where: { id }
      })

      return Result.ok(count > 0)
    } catch (_error) {
      return Result.fail(new DatabaseError('Failed to check course existence', _error as Error))
    }
  }

  async slugExists(slug: string): Promise<Result<boolean>> {
    try {
      const count = await prisma.course.count({
        where: { slug }
      })

      return Result.ok(count > 0)
    } catch (_error) {
      return Result.fail(new DatabaseError('Failed to check slug existence', _error as Error))
    }
  }

  async findMany(options?: CourseListOptions): Promise<Result<CourseListResult>> {
    try {
      const page = options?.page || 1
      const limit = options?.limit || 10
      const skip = (page - 1) * limit

      const where = this.buildWhereClause(options?.filters)

      const [courses, total] = await Promise.all([
        prisma.course.findMany({
          where,
          skip,
          take: limit,
          orderBy: this.buildOrderBy(options?.orderBy)
        }),
        prisma.course.count({ where })
      ])

      const domainCourses = courses.map((c) => this.mapper.toDomain(c))

      return Result.ok({
        courses: domainCourses,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      })
    } catch (_error) {
      return Result.fail(new DatabaseError('Failed to find courses', _error as Error))
    }
  }

  async findByInstructor(instructorId: string, options?: CourseListOptions): Promise<Result<CourseListResult>> {
    const filters = {
      ...options?.filters,
      instructorId
    }

    return this.findMany({
      ...options,
      filters
    })
  }

  async findFeatured(limit: number = 10): Promise<Result<Course[]>> {
    try {
      const courses = await prisma.course.findMany({
        where: {
          isFeatured: true,
          isPublished: true
        },
        take: limit,
        orderBy: { rating: 'desc' }
      })

      const domainCourses = courses.map((c) => this.mapper.toDomain(c))
      return Result.ok(domainCourses)
    } catch (_error) {
      return Result.fail(new DatabaseError('Failed to find featured courses', _error as Error))
    }
  }

  async findPublished(options?: CourseListOptions): Promise<Result<CourseListResult>> {
    const filters = {
      ...options?.filters,
      isPublished: true
    }

    return this.findMany({
      ...options,
      filters
    })
  }

  async countByInstructor(instructorId: string): Promise<Result<number>> {
    try {
      const count = await prisma.course.count({
        where: { instructorId }
      })

      return Result.ok(count)
    } catch (_error) {
      return Result.fail(new DatabaseError('Failed to count instructor courses', _error as Error))
    }
  }

  async getStatistics(courseId: string): Promise<
    Result<{
      enrollmentCount: number
      completionRate: number
      averageProgress: number
      reviewCount: number
      averageRating: number
    }>
  > {
    try {
      const [enrollments, reviews, course] = await Promise.all([
        prisma.enrollment.findMany({
          where: { courseId },
          select: {
            isCompleted: true,
            progress: true
          }
        }),
        prisma.review.findMany({
          where: { courseId },
          select: { rating: true }
        }),
        prisma.course.findUnique({
          where: { id: courseId },
          select: { rating: true, totalReviews: true }
        })
      ])

      const enrollmentCount = enrollments.length
      const completedCount = enrollments.filter((e) => e.isCompleted).length
      const completionRate = enrollmentCount > 0 ? (completedCount / enrollmentCount) * 100 : 0

      const totalProgress = enrollments.reduce((sum, e) => sum + e.progress, 0)
      const averageProgress = enrollmentCount > 0 ? totalProgress / enrollmentCount : 0

      return Result.ok({
        enrollmentCount,
        completionRate,
        averageProgress,
        reviewCount: course?.totalReviews || 0,
        averageRating: course?.rating || 0
      })
    } catch (_error) {
      return Result.fail(new DatabaseError('Failed to get course statistics', _error as Error))
    }
  }

  private buildWhereClause(filters?: CourseListOptions['filters']) {
    if (!filters) return {}

    const where: Record<string, unknown> = {}

    if (filters.instructorId) {
      where.instructorId = filters.instructorId
    }

    if (filters.categoryId) {
      where.categoryId = filters.categoryId
    }

    if (filters.level) {
      where.level = filters.level
    }

    if (filters.isPublished !== undefined) {
      where.isPublished = filters.isPublished
    }

    if (filters.isFeatured !== undefined) {
      where.isFeatured = filters.isFeatured
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      where.price = {}
      if (filters.minPrice !== undefined) {
        ;(where.price as Record<string, unknown>).gte = filters.minPrice
      }
      if (filters.maxPrice !== undefined) {
        ;(where.price as Record<string, unknown>).lte = filters.maxPrice
      }
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } }
      ]
    }

    return where
  }

  private buildOrderBy(orderBy?: CourseListOptions['orderBy']) {
    if (!orderBy) {
      return { createdAt: 'desc' }
    }

    return { [orderBy.field]: orderBy.direction }
  }

  private async publishDomainEvents(entity: Course): Promise<void> {
    const events = entity.domainEvents

    for (const event of events) {
      await eventBus.publish(event)
    }

    entity.clearEvents()
  }
}

export const courseRepository = new CourseRepository()
