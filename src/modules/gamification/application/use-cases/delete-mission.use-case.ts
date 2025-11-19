/**
 * Delete Mission Use Case
 */

import { BaseUseCase } from '@/core/shared/use-case.interface';
import { Result } from '@/core/shared/result';
import { NotFoundError } from '@/core/shared/errors';
import type { IMissionRepository } from '../../domain/mission.repository.interface';

interface DeleteMissionRequest {
  missionId: string;
  currentUserId: string;
}

export class DeleteMissionUseCase extends BaseUseCase<
  DeleteMissionRequest,
  void
> {
  constructor(private missionRepository: IMissionRepository) {
    super();
  }

  async execute(request: DeleteMissionRequest): Promise<Result<void>> {
    const { missionId } = request;

    // Find mission to ensure it exists
    const missionResult = await this.missionRepository.findById(missionId);

    if (missionResult.isFailure) {
      return Result.fail(missionResult.error);
    }

    if (!missionResult.value) {
      return Result.fail(new NotFoundError('Mission', missionId));
    }

    // Delete mission
    const deleteResult = await this.missionRepository.delete(missionId);

    if (deleteResult.isFailure) {
      return Result.fail(deleteResult.error);
    }

    return Result.ok(undefined);
  }
}
