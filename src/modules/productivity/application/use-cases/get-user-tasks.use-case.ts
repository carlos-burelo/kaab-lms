/**
 * Get User Tasks Use Case
 */

import { BaseUseCase } from '@/core/shared/use-case.interface';
import { Result } from '@/core/shared/result';
import { IPersonalTaskRepository } from '../../domain/personal-task.repository.interface';
import { PersonalTaskDTO, personalTaskMapper } from '../../infrastructure/personal-task.mapper';
import { TaskStatus } from '../../domain/value-objects';

interface GetUserTasksRequest {
  userId: string;
  status?: TaskStatus;
}

export class GetUserTasksUseCase extends BaseUseCase<
  GetUserTasksRequest,
  PersonalTaskDTO[]
> {
  constructor(private taskRepository: IPersonalTaskRepository) {
    super();
  }

  async execute(request: GetUserTasksRequest): Promise<Result<PersonalTaskDTO[]>> {
    const { userId, status } = request;

    // Find tasks
    let tasksResult;

    if (status) {
      tasksResult = await this.taskRepository.findByUserAndStatus(userId, status);
    } else {
      tasksResult = await this.taskRepository.findByUserId(userId);
    }

    if (tasksResult.isFailure) {
      return Result.fail(tasksResult.error);
    }

    // Map to DTOs
    const taskDTOs = tasksResult.value.map(task => personalTaskMapper.toDTO(task));

    return Result.ok(taskDTOs);
  }
}
