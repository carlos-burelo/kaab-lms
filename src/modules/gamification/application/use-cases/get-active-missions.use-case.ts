/**
 * Get Active Missions Use Case
 */

import { BaseUseCase } from '@/core/shared/use-case.interface';
import { Result } from '@/core/shared/result';
import type { IMissionRepository } from '../../domain/mission.repository.interface';
import {
  type MissionDTO,
  missionMapper,
} from '../../infrastructure/mission.mapper';

interface GetActiveMissionsRequest {
  currentUserId: string;
}

export class GetActiveMissionsUseCase extends BaseUseCase<
  GetActiveMissionsRequest,
  MissionDTO[]
> {
  constructor(private missionRepository: IMissionRepository) {
    super();
  }

  async execute(
    request: GetActiveMissionsRequest
  ): Promise<Result<MissionDTO[]>> {
    // Get active missions
    const missionsResult = await this.missionRepository.findActiveMissions();

    if (missionsResult.isFailure) {
      return Result.fail(missionsResult.error);
    }

    // Map to DTOs
    const missionDTOs = missionsResult.value.map((mission) =>
      missionMapper.toDTO(mission)
    );

    return Result.ok(missionDTOs);
  }
}
