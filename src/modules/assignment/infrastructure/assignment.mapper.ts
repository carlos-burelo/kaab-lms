/**
 * Assignment Mapper
 */

import type { Assignment as PrismaAssignment } from '@prisma/client'
import type { Mapper } from '@/core/shared/mapper.interface'
import { Assignment, type AssignmentProps } from '../domain/assignment.entity'

export interface AssignmentDTO {
  id: string
  title: string
  description?: string
  instructions?: string
  dueDate?: Date
  maxScore: number
  lessonId: string
  allowLateSubmission?: boolean
  latePenaltyPercent?: number | null
  createdAt: Date
  updatedAt: Date
}

class AssignmentMapper implements Mapper<Assignment, PrismaAssignment, AssignmentDTO> {
  toDomain(raw: PrismaAssignment): Assignment {
    const props: AssignmentProps = {
      title: raw.title,
      description: raw.description || undefined,
      instructions: raw.instructions || undefined,
      dueDate: raw.dueDate || undefined,
      maxScore: Number(raw.maxPoints),
      lessonId: raw.lessonId,
      allowLateSubmission: raw.allowLate,
      latePenaltyPercent: null, // Not in Prisma schema yet
      id: raw.id,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt
    }

    // Use factory method instead of direct instantiation
    const result = Assignment.create(props)
    if (result.isFailure) {
      throw new Error(`Failed to create Assignment entity: ${result.error.message}`)
    }

    return result.value
  }

  toPersistence(entity: Assignment): Omit<PrismaAssignment, 'createdAt' | 'updatedAt'> {
    return {
      id: entity.id,
      title: entity.title,
      description: entity.description || null,
      instructions: entity.instructions || null,
      dueDate: entity.dueDate || null,
      maxPoints: entity.maxScore,
      allowLate: entity.allowLateSubmission,
      lessonId: entity.lessonId,
      fileRequired: false, // Default value, can be enhanced later
      allowedFormats: null // Can be enhanced later
    }
  }

  toDTO(entity: Assignment): AssignmentDTO {
    return {
      id: entity.id,
      title: entity.title,
      description: entity.description,
      instructions: entity.instructions,
      dueDate: entity.dueDate,
      maxScore: entity.maxScore,
      lessonId: entity.lessonId,
      allowLateSubmission: entity.allowLateSubmission,
      latePenaltyPercent: entity.latePenaltyPercent,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt
    }
  }
}

export const assignmentMapper = new AssignmentMapper()
