/**
 * Assignment Repository Implementation
 */

import { eventBus } from '@/core/infrastructure/event-bus'
import { DatabaseError } from '@/core/shared/errors'
import { Result } from '@/core/shared/result'
import { prisma } from '@/lib/prisma'
import type { Assignment } from '../domain/assignment.entity'
import type { IAssignmentRepository } from '../domain/assignment.repository.interface'
import { assignmentMapper } from './assignment.mapper'

export class AssignmentRepository implements IAssignmentRepository {
  async findById(id: string): Promise<Result<Assignment | null>> {
    try {
      const assignment = await prisma.assignment.findUnique({
        where: { id }
      })

      if (!assignment) return Result.ok(null)

      return Result.ok(assignmentMapper.toDomain(assignment))
    } catch (_error) {
      return Result.fail(new DatabaseError('Failed to find assignment', _error as Error))
    }
  }

  async findByIdWithSubmissions(id: string): Promise<Result<Assignment | null>> {
    try {
      const assignment = await prisma.assignment.findUnique({
        where: { id },
        include: {
          submissions: {
            orderBy: {
              submittedAt: 'desc'
            }
          }
        }
      })

      if (!assignment) return Result.ok(null)

      return Result.ok(assignmentMapper.toDomain(assignment))
    } catch (_error) {
      return Result.fail(new DatabaseError('Failed to find assignment with submissions', _error as Error))
    }
  }

  async findByLesson(lessonId: string): Promise<Result<Assignment[]>> {
    try {
      const assignments = await prisma.assignment.findMany({
        where: { lessonId },
        orderBy: {
          createdAt: 'desc'
        }
      })

      return Result.ok(assignments.map(assignmentMapper.toDomain))
    } catch (_error) {
      return Result.fail(new DatabaseError('Failed to find assignments by lesson', _error as Error))
    }
  }

  async findUserSubmission(
    assignmentId: string,
    userId: string
  ): Promise<
    Result<{
      id: string
      content?: string
      fileId?: string
      score?: number
      feedback?: string
      submittedAt: Date
      gradedAt?: Date
    } | null>
  > {
    try {
      const submission = await prisma.assignmentSubmission.findFirst({
        where: {
          assignmentId,
          userId
        },
        orderBy: {
          submittedAt: 'desc'
        }
      })

      if (!submission) return Result.ok(null)

      return Result.ok({
        id: submission.id,
        content: submission.content || undefined,
        fileId: submission.fileId || undefined,
        score: submission.score ? Number(submission.score) : undefined,
        feedback: submission.feedback || undefined,
        submittedAt: submission.submittedAt,
        gradedAt: submission.gradedAt || undefined
      })
    } catch (_error) {
      return Result.fail(new DatabaseError('Failed to find user submission', _error as Error))
    }
  }

  async save(entity: Assignment): Promise<Result<Assignment>> {
    try {
      const model = assignmentMapper.toPersistence(entity)

      const saved = await prisma.assignment.upsert({
        where: { id: entity.id },
        create: model,
        update: model
      })

      // Publish domain events
      for (const event of entity.domainEvents) {
        await eventBus.publish(event)
      }
      entity.clearEvents()

      return Result.ok(assignmentMapper.toDomain(saved))
    } catch (_error) {
      return Result.fail(new DatabaseError('Failed to save assignment', _error as Error))
    }
  }

  async delete(id: string): Promise<Result<void>> {
    try {
      await prisma.assignment.delete({
        where: { id }
      })

      return Result.ok(undefined)
    } catch (_error) {
      return Result.fail(new DatabaseError('Failed to delete assignment', _error as Error))
    }
  }

  async exists(id: string): Promise<Result<boolean>> {
    try {
      const count = await prisma.assignment.count({
        where: { id }
      })

      return Result.ok(count > 0)
    } catch (_error) {
      return Result.fail(new DatabaseError('Failed to check assignment existence', _error as Error))
    }
  }

  async getAssignmentStats(assignmentId: string): Promise<
    Result<{
      totalSubmissions: number
      averageScore: number
      gradedCount: number
      pendingCount: number
    }>
  > {
    try {
      const submissions = await prisma.assignmentSubmission.findMany({
        where: { assignmentId },
        select: {
          score: true,
          gradedAt: true
        }
      })

      const totalSubmissions = submissions.length

      if (totalSubmissions === 0) {
        return Result.ok({
          totalSubmissions: 0,
          averageScore: 0,
          gradedCount: 0,
          pendingCount: 0
        })
      }

      const gradedSubmissions = submissions.filter((s) => s.gradedAt !== null)
      const gradedCount = gradedSubmissions.length
      const pendingCount = totalSubmissions - gradedCount

      const totalScore = gradedSubmissions.reduce((sum, submission) => {
        return sum + (submission.score ? Number(submission.score) : 0)
      }, 0)

      const averageScore = gradedCount > 0 ? totalScore / gradedCount : 0

      return Result.ok({
        totalSubmissions,
        averageScore,
        gradedCount,
        pendingCount
      })
    } catch (_error) {
      return Result.fail(new DatabaseError('Failed to get assignment stats', _error as Error))
    }
  }
}
