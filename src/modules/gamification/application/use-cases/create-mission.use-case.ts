/**
 * Create Mission Use Case
 */

import { BaseUseCase } from '@/core/shared/use-case.interface';
import { Result } from '@/core/shared/result';
import { Mission } from '../../domain/mission.entity';
import { IMissionRepository } from '../../domain/mission.repository.interface';
import { CreateMissionDTO } from '../dtos';
import {
  MissionDTO,
  missionMapper,
} from '../../infrastructure/mission.mapper';

interface CreateMissionRequest {
  dto: CreateMissionDTO;
  currentUserId: string;
}

export class CreateMissionUseCase extends BaseUseCase<
  CreateMissionRequest,
  MissionDTO
> {
  constructor(private missionRepository: IMissionRepository) {
    super();
  }

  async execute(request: CreateMissionRequest): Promise<Result<MissionDTO>> {
    const { dto } = request;

    // Create mission entity
    const missionResult = Mission.create({
      title: dto.title,
      description: dto.description,
      type: dto.type,
      difficulty: dto.difficulty,
      xpReward: dto.xpReward,
      coinReward: dto.coinReward,
      startDate: dto.startDate,
      endDate: dto.endDate,
    });

    if (missionResult.isFailure) {
      return Result.fail(missionResult.error);
    }

    // Save to repository
    const savedResult = await this.missionRepository.save(missionResult.value);

    if (savedResult.isFailure) {
      return Result.fail(savedResult.error);
    }

    // Map to DTO
    const missionDTO = missionMapper.toDTO(savedResult.value);

    return Result.ok(missionDTO);
  }
}
