/**
 * Assignment Mapper
 */

import { Mapper } from '@/core/shared/mapper.interface';
import { Assignment, AssignmentProps } from '../domain/assignment.entity';
import type { Assignment as PrismaAssignment } from '@prisma/client';

export interface AssignmentDTO {
  id: string;
  title: string;
  description?: string;
  dueDate?: Date;
  maxScore: number;
  lessonId: string;
  createdAt: Date;
  updatedAt: Date;
}

class AssignmentMapper implements Mapper<Assignment, PrismaAssignment, AssignmentDTO> {
  toDomain(raw: PrismaAssignment): Assignment {
    const props: AssignmentProps = {
      title: raw.title,
      description: raw.description || undefined,
      dueDate: raw.dueDate || undefined,
      maxScore: Number(raw.maxScore),
      lessonId: raw.lessonId,
      id: raw.id,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };

    // Use factory method instead of direct instantiation
    const result = Assignment.create(props);
    if (result.isFailure) {
      throw new Error(`Failed to create Assignment entity: ${result.error.message}`);
    }

    return result.value;
  }

  toPersistence(entity: Assignment): Omit<PrismaAssignment, 'createdAt' | 'updatedAt'> {
    return {
      id: entity.id,
      title: entity.title,
      description: entity.description || null,
      dueDate: entity.dueDate || null,
      maxScore: entity.maxScore,
      lessonId: entity.lessonId,
    };
  }

  toDTO(entity: Assignment): AssignmentDTO {
    return {
      id: entity.id,
      title: entity.title,
      description: entity.description,
      dueDate: entity.dueDate,
      maxScore: entity.maxScore,
      lessonId: entity.lessonId,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}

export const assignmentMapper = new AssignmentMapper();
