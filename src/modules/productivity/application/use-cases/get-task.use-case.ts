/**
 * Get Personal Task Use Case
 */

import { BaseUseCase } from '@/core/shared/use-case.interface';
import { Result } from '@/core/shared/result';
import { NotFoundError, ForbiddenError } from '@/core/shared/errors';
import { IPersonalTaskRepository } from '../../domain/personal-task.repository.interface';
import { PersonalTaskDTO, personalTaskMapper } from '../../infrastructure/personal-task.mapper';

interface GetTaskRequest {
  taskId: string;
  currentUserId: string;
}

export class GetTaskUseCase extends BaseUseCase<
  GetTaskRequest,
  PersonalTaskDTO
> {
  constructor(private taskRepository: IPersonalTaskRepository) {
    super();
  }

  async execute(request: GetTaskRequest): Promise<Result<PersonalTaskDTO>> {
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
        new ForbiddenError('You do not have permission to view this task')
      );
    }

    // Map to DTO
    const taskDTO = personalTaskMapper.toDTO(task);

    return Result.ok(taskDTO);
  }
}
