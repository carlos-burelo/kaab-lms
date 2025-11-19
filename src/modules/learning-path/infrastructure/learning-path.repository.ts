/**
 * Learning Path Repository Implementation
 */

import { eventBus } from '@/core/infrastructure/event-bus'
import { DatabaseError } from '@/core/shared/errors'
import { Result } from '@/core/shared/result'
import { prisma } from '@/lib/prisma'
import type { LearningPath } from '../domain/learning-path.entity'
import type { ILearningPathRepository } from '../domain/learning-path.repository.interface'
import type { UserLearningPathProgress } from '../domain/user-learning-path-progress.entity'
import {
  learningPathEdgeMapper,
  learningPathMapper,
  learningPathNodeMapper,
  userLearningPathProgressMapper
} from './learning-path.mapper'

export class LearningPathRepository implements ILearningPathRepository {
  async findById(id: string): Promise<Result<LearningPath | null>> {
    try {
      const learningPath = await prisma.learningPath.findUnique({
        where: { id }
      })

      if (!learningPath) return Result.ok(null)

      return Result.ok(learningPathMapper.toDomain(learningPath))
    } catch (_error) {
      return Result.fail(new DatabaseError('Failed to find learning path', _error as Error))
    }
  }

  async findByIdWithGraph(id: string): Promise<Result<LearningPath | null>> {
    try {
      const learningPath = await prisma.learningPath.findUnique({
        where: { id },
        include: {
          nodes: true,
          edges: true
        }
      })

      if (!learningPath) return Result.ok(null)

      const domainEntity = learningPathMapper.toDomain(learningPath)

      // Map nodes
      if (learningPath.nodes) {
        for (const node of learningPath.nodes) {
          const nodeEntity = learningPathNodeMapper.toDomain(node)
          domainEntity.addNode(nodeEntity)
        }
      }

      // Map edges
      if (learningPath.edges) {
        for (const edge of learningPath.edges) {
          const edgeEntity = learningPathEdgeMapper.toDomain(edge)
          domainEntity.addEdge(edgeEntity)
        }
      }

      return Result.ok(domainEntity)
    } catch (_error) {
      return Result.fail(new DatabaseError('Failed to find learning path with graph', _error as Error))
    }
  }

  async findAllPublished(): Promise<Result<LearningPath[]>> {
    try {
      const learningPaths = await prisma.learningPath.findMany({
        where: { isPublished: true },
        orderBy: { createdAt: 'desc' }
      })

      const domainEntities = learningPaths.map((lp) => learningPathMapper.toDomain(lp))

      return Result.ok(domainEntities)
    } catch (_error) {
      return Result.fail(new DatabaseError('Failed to find published learning paths', _error as Error))
    }
  }

  async findByCreator(creatorId: string): Promise<Result<LearningPath[]>> {
    try {
      const learningPaths = await prisma.learningPath.findMany({
        where: { createdBy: creatorId },
        orderBy: { createdAt: 'desc' }
      })

      const domainEntities = learningPaths.map((lp) => learningPathMapper.toDomain(lp))

      return Result.ok(domainEntities)
    } catch (_error) {
      return Result.fail(new DatabaseError('Failed to find learning paths by creator', _error as Error))
    }
  }

  async getUserProgress(userId: string, learningPathId: string): Promise<Result<UserLearningPathProgress | null>> {
    try {
      const progress = await prisma.userLearningPathProgress.findUnique({
        where: {
          userId_learningPathId: {
            userId,
            learningPathId
          }
        }
      })

      if (!progress) return Result.ok(null)

      return Result.ok(userLearningPathProgressMapper.toDomain(progress))
    } catch (_error) {
      return Result.fail(new DatabaseError('Failed to get user progress', _error as Error))
    }
  }

  async saveUserProgress(progress: UserLearningPathProgress): Promise<Result<UserLearningPathProgress>> {
    try {
      const model = userLearningPathProgressMapper.toPersistence(progress)

      const saved = await prisma.userLearningPathProgress.upsert({
        where: { id: progress.id },
        create: model,
        update: model
      })

      return Result.ok(userLearningPathProgressMapper.toDomain(saved))
    } catch (_error) {
      return Result.fail(new DatabaseError('Failed to save user progress', _error as Error))
    }
  }

  async hasUserStarted(userId: string, learningPathId: string): Promise<Result<boolean>> {
    try {
      const count = await prisma.userLearningPathProgress.count({
        where: {
          userId,
          learningPathId
        }
      })

      return Result.ok(count > 0)
    } catch (_error) {
      return Result.fail(new DatabaseError('Failed to check if user started learning path', _error as Error))
    }
  }

  async findUserInProgress(userId: string): Promise<Result<LearningPath[]>> {
    try {
      const progressRecords = await prisma.userLearningPathProgress.findMany({
        where: {
          userId,
          isCompleted: false
        },
        include: {
          learningPath: true
        }
      })

      const learningPaths = progressRecords.map((pr) => learningPathMapper.toDomain(pr.learningPath))

      return Result.ok(learningPaths)
    } catch (_error) {
      return Result.fail(new DatabaseError('Failed to find user in-progress learning paths', _error as Error))
    }
  }

  async findUserCompleted(userId: string): Promise<Result<LearningPath[]>> {
    try {
      const progressRecords = await prisma.userLearningPathProgress.findMany({
        where: {
          userId,
          isCompleted: true
        },
        include: {
          learningPath: true
        }
      })

      const learningPaths = progressRecords.map((pr) => learningPathMapper.toDomain(pr.learningPath))

      return Result.ok(learningPaths)
    } catch (_error) {
      return Result.fail(new DatabaseError('Failed to find user completed learning paths', _error as Error))
    }
  }

  async getStats(learningPathId: string): Promise<
    Result<{
      totalUsers: number
      completedUsers: number
      averageProgress: number
      completionRate: number
    }>
  > {
    try {
      const progressRecords = await prisma.userLearningPathProgress.findMany({
        where: { learningPathId }
      })

      const totalUsers = progressRecords.length

      if (totalUsers === 0) {
        return Result.ok({
          totalUsers: 0,
          completedUsers: 0,
          averageProgress: 0,
          completionRate: 0
        })
      }

      const completedUsers = progressRecords.filter((pr) => pr.isCompleted).length

      // Get total nodes count
      const nodesCount = await prisma.learningPathNode.count({
        where: { learningPathId }
      })

      // Calculate average progress
      const totalProgress = progressRecords.reduce((sum, pr) => {
        const completedNodes = (pr.completedNodes as string[]).length
        const progress = nodesCount > 0 ? (completedNodes / nodesCount) * 100 : 0
        return sum + progress
      }, 0)

      const averageProgress = totalProgress / totalUsers
      const completionRate = (completedUsers / totalUsers) * 100

      return Result.ok({
        totalUsers,
        completedUsers,
        averageProgress,
        completionRate
      })
    } catch (_error) {
      return Result.fail(new DatabaseError('Failed to get learning path stats', _error as Error))
    }
  }

  async save(entity: LearningPath): Promise<Result<LearningPath>> {
    try {
      const model = learningPathMapper.toPersistence(entity)

      // Start a transaction to save learning path with nodes and edges
      const saved = await prisma.$transaction(async (tx) => {
        // Upsert learning path
        const savedLearningPath = await tx.learningPath.upsert({
          where: { id: entity.id },
          create: model,
          update: model
        })

        // Handle nodes
        if (entity.nodes.length > 0) {
          // Delete existing nodes that are not in the entity
          const nodeIds = entity.nodes.map((n) => n.id)
          await tx.learningPathNode.deleteMany({
            where: {
              learningPathId: entity.id,
              id: {
                notIn: nodeIds
              }
            }
          })

          // Upsert nodes
          for (const node of entity.nodes) {
            const nodeModel = learningPathNodeMapper.toPersistence(node)
            await tx.learningPathNode.upsert({
              where: { id: node.id },
              create: nodeModel,
              update: nodeModel
            })
          }
        }

        // Handle edges
        if (entity.edges.length > 0) {
          // Delete existing edges that are not in the entity
          const edgeIds = entity.edges.map((e) => e.id)
          await tx.learningPathEdge.deleteMany({
            where: {
              learningPathId: entity.id,
              id: {
                notIn: edgeIds
              }
            }
          })

          // Upsert edges
          for (const edge of entity.edges) {
            const edgeModel = learningPathEdgeMapper.toPersistence(edge)
            await tx.learningPathEdge.upsert({
              where: { id: edge.id },
              create: edgeModel,
              update: edgeModel
            })
          }
        }

        return savedLearningPath
      })

      // Publish domain events
      for (const event of entity.domainEvents) {
        await eventBus.publish(event)
      }
      entity.clearEvents()

      return Result.ok(learningPathMapper.toDomain(saved))
    } catch (_error) {
      return Result.fail(new DatabaseError('Failed to save learning path', _error as Error))
    }
  }

  async delete(id: string): Promise<Result<void>> {
    try {
      // Cascade delete will handle nodes, edges, and progress
      await prisma.learningPath.delete({
        where: { id }
      })

      return Result.ok(undefined)
    } catch (_error) {
      return Result.fail(new DatabaseError('Failed to delete learning path', _error as Error))
    }
  }

  async exists(id: string): Promise<Result<boolean>> {
    try {
      const count = await prisma.learningPath.count({
        where: { id }
      })

      return Result.ok(count > 0)
    } catch (_error) {
      return Result.fail(new DatabaseError('Failed to check learning path existence', _error as Error))
    }
  }
}
