/**
 * Cancel Personal Task Use Case
 */

import { ForbiddenError, NotFoundError } from '@/core/shared/errors'
import { Result } from '@/core/shared/result'
import { BaseUseCase } from '@/core/shared/use-case.interface'
import type { IPersonalTaskRepository } from '../../domain/personal-task.repository.interface'
import { type PersonalTaskDTO, personalTaskMapper } from '../../infrastructure/personal-task.mapper'

interface CancelTaskRequest {
  taskId: string
  currentUserId: string
}

export class CancelTaskUseCase extends BaseUseCase<CancelTaskRequest, PersonalTaskDTO> {
  constructor(private taskRepository: IPersonalTaskRepository) {
    super()
  }

  async execute(request: CancelTaskRequest): Promise<Result<PersonalTaskDTO>> {
    const { taskId, currentUserId } = request

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
      return Result.fail(new ForbiddenError('You do not have permission to cancel this task'))
    }

    // Cancel task
    const cancelResult = task.cancel()

    if (cancelResult.isFailure) {
      return Result.fail(cancelResult.error)
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
