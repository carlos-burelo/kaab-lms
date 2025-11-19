/**
 * Update Mission Use Case
 */

import { BaseUseCase } from '@/core/shared/use-case.interface';
import { Result } from '@/core/shared/result';
import { NotFoundError } from '@/core/shared/errors';
import type { IMissionRepository } from '../../domain/mission.repository.interface';
import type { UpdateMissionDTO } from '../dtos';
import {
  type MissionDTO,
  missionMapper,
} from '../../infrastructure/mission.mapper';

interface UpdateMissionRequest {
  missionId: string;
  dto: UpdateMissionDTO;
  currentUserId: string;
}

export class UpdateMissionUseCase extends BaseUseCase<
  UpdateMissionRequest,
  MissionDTO
> {
  constructor(private missionRepository: IMissionRepository) {
    super();
  }

  async execute(request: UpdateMissionRequest): Promise<Result<MissionDTO>> {
    const { missionId, dto } = request;

    // Find mission
    const missionResult = await this.missionRepository.findById(missionId);

    if (missionResult.isFailure) {
      return Result.fail(missionResult.error);
    }

    if (!missionResult.value) {
      return Result.fail(new NotFoundError('Mission', missionId));
    }

    const mission = missionResult.value;

    // Update properties
    if (dto.title) {
      const updateTitleResult = mission.updateTitle(dto.title);
      if (updateTitleResult.isFailure) {
        return Result.fail(updateTitleResult.error);
      }
    }

    if (dto.description) {
      const updateDescriptionResult = mission.updateDescription(
        dto.description
      );
      if (updateDescriptionResult.isFailure) {
        return Result.fail(updateDescriptionResult.error);
      }
    }

    if (dto.type) {
      mission.updateType(dto.type);
    }

    if (dto.difficulty) {
      mission.updateDifficulty(dto.difficulty);
    }

    if (dto.xpReward !== undefined) {
      const updateXpRewardResult = mission.updateXpReward(dto.xpReward);
      if (updateXpRewardResult.isFailure) {
        return Result.fail(updateXpRewardResult.error);
      }
    }

    if (dto.coinReward !== undefined) {
      const updateCoinRewardResult = mission.updateCoinReward(dto.coinReward);
      if (updateCoinRewardResult.isFailure) {
        return Result.fail(updateCoinRewardResult.error);
      }
    }

    if (dto.startDate !== undefined || dto.endDate !== undefined) {
      const updateDatesResult = mission.updateDates(
        dto.startDate,
        dto.endDate
      );
      if (updateDatesResult.isFailure) {
        return Result.fail(updateDatesResult.error);
      }
    }

    // Save updated mission
    const savedResult = await this.missionRepository.save(mission);

    if (savedResult.isFailure) {
      return Result.fail(savedResult.error);
    }

    // Map to DTO
    const missionDTO = missionMapper.toDTO(savedResult.value);

    return Result.ok(missionDTO);
  }
}
