/**
 * Create Personal Task Use Case
 */

import { Result } from '@/core/shared/result'
import { BaseUseCase } from '@/core/shared/use-case.interface'
import { PersonalTask } from '../../domain/personal-task.entity'
import type { IPersonalTaskRepository } from '../../domain/personal-task.repository.interface'
import { type PersonalTaskDTO, personalTaskMapper } from '../../infrastructure/personal-task.mapper'
import type { CreateTaskDTO } from '../dtos'

interface CreateTaskRequest {
  dto: CreateTaskDTO
  currentUserId: string
}

export class CreateTaskUseCase extends BaseUseCase<CreateTaskRequest, PersonalTaskDTO> {
  constructor(private taskRepository: IPersonalTaskRepository) {
    super()
  }

  async execute(request: CreateTaskRequest): Promise<Result<PersonalTaskDTO>> {
    const { dto } = request

    // Create task entity
    const taskResult = PersonalTask.create({
      userId: dto.userId,
      title: dto.title,
      description: dto.description,
      priority: dto.priority,
      dueDate: dto.dueDate
    })

    if (taskResult.isFailure) {
      return Result.fail(taskResult.error)
    }

    // Save to repository
    const savedResult = await this.taskRepository.save(taskResult.value)

    if (savedResult.isFailure) {
      return Result.fail(savedResult.error)
    }

    // Map to DTO
    const taskDTO = personalTaskMapper.toDTO(savedResult.value)

    return Result.ok(taskDTO)
  }
}
