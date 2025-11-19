/**
 * Learning Path Mapper
 */

import type {
  LearningPath as PrismaLearningPath,
  LearningPathEdge as PrismaLearningPathEdge,
  LearningPathNode as PrismaLearningPathNode,
  UserLearningPathProgress as PrismaUserLearningPathProgress
} from '@prisma/client'
import type { Mapper } from '@/core/shared/mapper.interface'
import { LearningPath, type LearningPathProps } from '../domain/learning-path.entity'
import { LearningPathEdge, type LearningPathEdgeProps } from '../domain/learning-path-edge.entity'
import { LearningPathNode, type LearningPathNodeProps } from '../domain/learning-path-node.entity'
import { UserLearningPathProgress, type UserLearningPathProgressProps } from '../domain/user-learning-path-progress.entity'
import type { NodeType } from '../domain/value-objects/node-type'

// DTOs
export interface LearningPathDTO {
  id: string
  title: string
  description?: string
  isPublished: boolean
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export interface LearningPathNodeDTO {
  id: string
  learningPathId: string
  type: NodeType
  courseId?: string
  position: { x: number; y: number }
  data?: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}

export interface LearningPathEdgeDTO {
  id: string
  learningPathId: string
  sourceNodeId: string
  targetNodeId: string
  condition?: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}

export interface UserLearningPathProgressDTO {
  id: string
  userId: string
  learningPathId: string
  currentNodeId?: string
  completedNodes: string[]
  isCompleted: boolean
  completedAt?: Date
  createdAt: Date
  updatedAt: Date
}

// Learning Path Mapper
class LearningPathMapper implements Mapper<LearningPath, PrismaLearningPath, LearningPathDTO> {
  toDomain(raw: PrismaLearningPath): LearningPath {
    const props: LearningPathProps = {
      title: raw.title,
      description: raw.description || undefined,
      isPublished: raw.isPublished,
      createdBy: raw.createdBy,
      id: raw.id,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt
    }

    const result = LearningPath.create(props)
    if (result.isFailure) {
      throw new Error(`Failed to create LearningPath entity: ${result.error.message}`)
    }

    return result.value
  }

  toPersistence(entity: LearningPath): Omit<PrismaLearningPath, 'createdAt' | 'updatedAt'> {
    return {
      id: entity.id,
      title: entity.title,
      description: entity.description || null,
      isPublished: entity.isPublished,
      createdBy: entity.createdBy
    }
  }

  toDTO(entity: LearningPath): LearningPathDTO {
    return {
      id: entity.id,
      title: entity.title,
      description: entity.description,
      isPublished: entity.isPublished,
      createdBy: entity.createdBy,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt
    }
  }
}

// Learning Path Node Mapper
class LearningPathNodeMapper implements Mapper<LearningPathNode, PrismaLearningPathNode, LearningPathNodeDTO> {
  toDomain(raw: PrismaLearningPathNode): LearningPathNode {
    const position = raw.position as { x: number; y: number }
    const data = (raw.data as Record<string, unknown>) || undefined

    const props: LearningPathNodeProps = {
      learningPathId: raw.learningPathId,
      type: raw.type as NodeType,
      courseId: raw.courseId || undefined,
      position,
      data,
      id: raw.id,
      createdAt: raw.createdAt,
      updatedAt: new Date() // Prisma model doesn't have updatedAt
    }

    const result = LearningPathNode.create(props)
    if (result.isFailure) {
      throw new Error(`Failed to create LearningPathNode entity: ${result.error.message}`)
    }

    return result.value
  }

  toPersistence(entity: LearningPathNode): Omit<PrismaLearningPathNode, 'createdAt'> {
    return {
      id: entity.id,
      learningPathId: entity.learningPathId,
      type: entity.type,
      courseId: entity.courseId || null,
      position: entity.position,
      data: entity.data || null
    }
  }

  toDTO(entity: LearningPathNode): LearningPathNodeDTO {
    return {
      id: entity.id,
      learningPathId: entity.learningPathId,
      type: entity.type,
      courseId: entity.courseId,
      position: entity.position,
      data: entity.data,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt
    }
  }
}

// Learning Path Edge Mapper
class LearningPathEdgeMapper implements Mapper<LearningPathEdge, PrismaLearningPathEdge, LearningPathEdgeDTO> {
  toDomain(raw: PrismaLearningPathEdge): LearningPathEdge {
    const condition = (raw.condition as Record<string, unknown>) || undefined

    const props: LearningPathEdgeProps = {
      learningPathId: raw.learningPathId,
      sourceNodeId: raw.sourceNodeId,
      targetNodeId: raw.targetNodeId,
      condition,
      id: raw.id,
      createdAt: raw.createdAt,
      updatedAt: new Date() // Prisma model doesn't have updatedAt
    }

    const result = LearningPathEdge.create(props)
    if (result.isFailure) {
      throw new Error(`Failed to create LearningPathEdge entity: ${result.error.message}`)
    }

    return result.value
  }

  toPersistence(entity: LearningPathEdge): Omit<PrismaLearningPathEdge, 'createdAt'> {
    return {
      id: entity.id,
      learningPathId: entity.learningPathId,
      sourceNodeId: entity.sourceNodeId,
      targetNodeId: entity.targetNodeId,
      condition: entity.condition || null
    }
  }

  toDTO(entity: LearningPathEdge): LearningPathEdgeDTO {
    return {
      id: entity.id,
      learningPathId: entity.learningPathId,
      sourceNodeId: entity.sourceNodeId,
      targetNodeId: entity.targetNodeId,
      condition: entity.condition,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt
    }
  }
}

// User Learning Path Progress Mapper
class UserLearningPathProgressMapper
  implements Mapper<UserLearningPathProgress, PrismaUserLearningPathProgress, UserLearningPathProgressDTO>
{
  toDomain(raw: PrismaUserLearningPathProgress): UserLearningPathProgress {
    const completedNodes = (raw.completedNodes as string[]) || []

    const props: UserLearningPathProgressProps = {
      userId: raw.userId,
      learningPathId: raw.learningPathId,
      currentNodeId: raw.currentNodeId || undefined,
      completedNodes,
      isCompleted: raw.isCompleted,
      completedAt: raw.completedAt || undefined,
      id: raw.id,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt
    }

    const result = UserLearningPathProgress.create(props)
    if (result.isFailure) {
      throw new Error(`Failed to create UserLearningPathProgress entity: ${result.error.message}`)
    }

    return result.value
  }

  toPersistence(entity: UserLearningPathProgress): Omit<PrismaUserLearningPathProgress, 'createdAt' | 'updatedAt'> {
    return {
      id: entity.id,
      userId: entity.userId,
      learningPathId: entity.learningPathId,
      currentNodeId: entity.currentNodeId || null,
      completedNodes: entity.completedNodes,
      isCompleted: entity.isCompleted,
      completedAt: entity.completedAt || null
    }
  }

  toDTO(entity: UserLearningPathProgress): UserLearningPathProgressDTO {
    return {
      id: entity.id,
      userId: entity.userId,
      learningPathId: entity.learningPathId,
      currentNodeId: entity.currentNodeId,
      completedNodes: entity.completedNodes,
      isCompleted: entity.isCompleted,
      completedAt: entity.completedAt,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt
    }
  }
}

// Export mapper instances
export const learningPathMapper = new LearningPathMapper()
export const learningPathNodeMapper = new LearningPathNodeMapper()
export const learningPathEdgeMapper = new LearningPathEdgeMapper()
export const userLearningPathProgressMapper = new UserLearningPathProgressMapper()
