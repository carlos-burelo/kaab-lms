/**
 * Get Mission Use Case
 */

import { NotFoundError } from '@/core/shared/errors'
import { Result } from '@/core/shared/result'
import { BaseUseCase } from '@/core/shared/use-case.interface'
import type { IMissionRepository } from '../../domain/mission.repository.interface'
import { type MissionDTO, missionMapper } from '../../infrastructure/mission.mapper'

interface GetMissionRequest {
  missionId: string
  currentUserId: string
}

export class GetMissionUseCase extends BaseUseCase<GetMissionRequest, MissionDTO> {
  constructor(private missionRepository: IMissionRepository) {
    super()
  }

  async execute(request: GetMissionRequest): Promise<Result<MissionDTO>> {
    const { missionId } = request

    // Find mission
    const missionResult = await this.missionRepository.findById(missionId)

    if (missionResult.isFailure) {
      return Result.fail(missionResult.error)
    }

    if (!missionResult.value) {
      return Result.fail(new NotFoundError('Mission', missionId))
    }

    // Map to DTO
    const missionDTO = missionMapper.toDTO(missionResult.value)

    return Result.ok(missionDTO)
  }
}
