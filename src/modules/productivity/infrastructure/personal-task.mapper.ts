/**
 * PersonalTask Mapper
 */

import type { Mapper } from '@/core/shared/mapper.interface';
import { PersonalTask, type PersonalTaskProps } from '../domain/personal-task.entity';
import type { TaskPriority, TaskStatus } from '../domain/value-objects';
import type { PersonalTask as PrismaPersonalTask } from '@prisma/client';

export interface PersonalTaskDTO {
  id: string;
  userId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

class PersonalTaskMapper implements Mapper<PersonalTask, PrismaPersonalTask, PersonalTaskDTO> {
  toDomain(raw: PrismaPersonalTask): PersonalTask {
    const props: PersonalTaskProps = {
      userId: raw.userId,
      title: raw.title,
      description: raw.description || undefined,
      status: raw.status as TaskStatus,
      priority: raw.priority as TaskPriority,
      dueDate: raw.dueDate || undefined,
      completedAt: raw.completedAt || undefined,
      id: raw.id,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };

    // Use factory method instead of direct instantiation
    const result = PersonalTask.create(props);
    if (result.isFailure) {
      throw new Error(`Failed to create PersonalTask entity: ${result.error.message}`);
    }

    return result.value;
  }

  toPersistence(entity: PersonalTask): Omit<PrismaPersonalTask, 'createdAt' | 'updatedAt'> {
    return {
      id: entity.id,
      userId: entity.userId,
      title: entity.title,
      description: entity.description || null,
      status: entity.status,
      priority: entity.priority,
      dueDate: entity.dueDate || null,
      completedAt: entity.completedAt || null,
    };
  }

  toDTO(entity: PersonalTask): PersonalTaskDTO {
    return {
      id: entity.id,
      userId: entity.userId,
      title: entity.title,
      description: entity.description,
      status: entity.status,
      priority: entity.priority,
      dueDate: entity.dueDate,
      completedAt: entity.completedAt,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}

export const personalTaskMapper = new PersonalTaskMapper();
