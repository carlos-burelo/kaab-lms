/**
 * Get User Tasks Use Case
 */

import { Result } from '@/core/shared/result'
import { BaseUseCase } from '@/core/shared/use-case.interface'
import type { IPersonalTaskRepository } from '../../domain/personal-task.repository.interface'
import type { TaskStatus } from '../../domain/value-objects'
import { type PersonalTaskDTO, personalTaskMapper } from '../../infrastructure/personal-task.mapper'

interface GetUserTasksRequest {
  userId: string
  status?: TaskStatus
}

export class GetUserTasksUseCase extends BaseUseCase<GetUserTasksRequest, PersonalTaskDTO[]> {
  constructor(private taskRepository: IPersonalTaskRepository) {
    super()
  }

  async execute(request: GetUserTasksRequest): Promise<Result<PersonalTaskDTO[]>> {
    const { userId, status } = request

    // Find tasks
    let tasksResult: Awaited<ReturnType<typeof this.personalTaskRepository.findAll>> | undefined

    if (status) {
      tasksResult = await this.taskRepository.findByUserAndStatus(userId, status)
    } else {
      tasksResult = await this.taskRepository.findByUserId(userId)
    }

    if (tasksResult.isFailure) {
      return Result.fail(tasksResult.error)
    }

    // Map to DTOs
    const taskDTOs = tasksResult.value.map((task) => personalTaskMapper.toDTO(task))

    return Result.ok(taskDTOs)
  }
}
