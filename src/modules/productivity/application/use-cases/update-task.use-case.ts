/**
 * Update Personal Task Use Case
 */

import { ForbiddenError, NotFoundError } from '@/core/shared/errors'
import { Result } from '@/core/shared/result'
import { BaseUseCase } from '@/core/shared/use-case.interface'
import type { IPersonalTaskRepository } from '../../domain/personal-task.repository.interface'
import { type PersonalTaskDTO, personalTaskMapper } from '../../infrastructure/personal-task.mapper'
import type { UpdateTaskDTO } from '../dtos'

interface UpdateTaskRequest {
  taskId: string
  dto: UpdateTaskDTO
  currentUserId: string
}

export class UpdateTaskUseCase extends BaseUseCase<UpdateTaskRequest, PersonalTaskDTO> {
  constructor(private taskRepository: IPersonalTaskRepository) {
    super()
  }

  async execute(request: UpdateTaskRequest): Promise<Result<PersonalTaskDTO>> {
    const { taskId, dto, currentUserId } = request

    // Find task
    const taskResult = await this.taskRepository.findById(taskId)

    if (taskResult.isFailure) {
      return Result.fail(taskResult.error)
    }

    if (!taskResult.value) {
      return Result.fail(new NotFoundError('PersonalTask', taskId))
    }

    const task = taskResult.value

    // Check permissions
    if (!task.canBeEditedBy(currentUserId)) {
      return Result.fail(new ForbiddenError('You do not have permission to edit this task'))
    }

    // Update task properties
    if (dto.title !== undefined) {
      const titleResult = task.updateTitle(dto.title)
      if (titleResult.isFailure) {
        return Result.fail(titleResult.error)
      }
    }

    if (dto.description !== undefined) {
      const descResult = task.updateDescription(dto.description)
      if (descResult.isFailure) {
        return Result.fail(descResult.error)
      }
    }

    if (dto.status !== undefined) {
      const statusResult = task.updateStatus(dto.status)
      if (statusResult.isFailure) {
        return Result.fail(statusResult.error)
      }
    }

    if (dto.priority !== undefined) {
      const priorityResult = task.updatePriority(dto.priority)
      if (priorityResult.isFailure) {
        return Result.fail(priorityResult.error)
      }
    }

    if (dto.dueDate !== undefined) {
      const dueDateResult = task.updateDueDate(dto.dueDate || undefined)
      if (dueDateResult.isFailure) {
        return Result.fail(dueDateResult.error)
      }
    }

    // Save to repository
    const savedResult = await this.taskRepository.save(task)

    if (savedResult.isFailure) {
      return Result.fail(savedResult.error)
    }

    // Map to DTO
    const taskDTO = personalTaskMapper.toDTO(savedResult.value)

    return Result.ok(taskDTO)
  }
}
