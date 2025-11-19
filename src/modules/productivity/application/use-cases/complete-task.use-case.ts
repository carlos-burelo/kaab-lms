/**
 * Complete Personal Task Use Case
 */

import { BaseUseCase } from '@/core/shared/use-case.interface';
import { Result } from '@/core/shared/result';
import { NotFoundError, ForbiddenError } from '@/core/shared/errors';
import type { IPersonalTaskRepository } from '../../domain/personal-task.repository.interface';
import { type PersonalTaskDTO, personalTaskMapper } from '../../infrastructure/personal-task.mapper';

interface CompleteTaskRequest {
  taskId: string;
  currentUserId: string;
}

export class CompleteTaskUseCase extends BaseUseCase<
  CompleteTaskRequest,
  PersonalTaskDTO
> {
  constructor(private taskRepository: IPersonalTaskRepository) {
    super();
  }

  async execute(request: CompleteTaskRequest): Promise<Result<PersonalTaskDTO>> {
    const { taskId, currentUserId } = request;

    // Find task
    const taskResult = await this.taskRepository.findById(taskId);

    if (taskResult.isFailure) {
      return Result.fail(taskResult.error);
    }

    if (!taskResult.value) {
      return Result.fail(new NotFoundError('PersonalTask', taskId));
    }

    const task = taskResult.value;

    // Check permissions
    if (!task.canBeEditedBy(currentUserId)) {
      return Result.fail(
        new ForbiddenError('You do not have permission to complete this task')
      );
    }

    // Complete task
    const completeResult = task.complete();

    if (completeResult.isFailure) {
      return Result.fail(completeResult.error);
    }

    // Save to repository
    const savedResult = await this.taskRepository.save(task);

    if (savedResult.isFailure) {
      return Result.fail(savedResult.error);
    }

    // Map to DTO
    const taskDTO = personalTaskMapper.toDTO(savedResult.value);

    return Result.ok(taskDTO);
  }
}
