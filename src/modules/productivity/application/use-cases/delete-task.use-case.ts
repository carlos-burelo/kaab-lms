/**
 * Delete Personal Task Use Case
 */

import { BaseUseCase } from '@/core/shared/use-case.interface';
import { Result } from '@/core/shared/result';
import { NotFoundError, ForbiddenError } from '@/core/shared/errors';
import { IPersonalTaskRepository } from '../../domain/personal-task.repository.interface';

interface DeleteTaskRequest {
  taskId: string;
  currentUserId: string;
}

export class DeleteTaskUseCase extends BaseUseCase<DeleteTaskRequest, void> {
  constructor(private taskRepository: IPersonalTaskRepository) {
    super();
  }

  async execute(request: DeleteTaskRequest): Promise<Result<void>> {
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
        new ForbiddenError('You do not have permission to delete this task')
      );
    }

    // Delete from repository
    const deleteResult = await this.taskRepository.delete(taskId);

    if (deleteResult.isFailure) {
      return Result.fail(deleteResult.error);
    }

    return Result.ok(undefined);
  }
}
