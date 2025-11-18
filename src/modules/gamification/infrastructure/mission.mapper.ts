/**
 * Mission Mapper
 */

import { Mapper } from '@/core/shared/mapper.interface';
import { Mission, MissionProps } from '../domain/mission.entity';
import { MissionType, MissionDifficulty } from '../domain/value-objects';
import type { Mission as PrismaMission } from '@prisma/client';

export interface MissionDTO {
  id: string;
  title: string;
  description: string;
  type: MissionType;
  difficulty: MissionDifficulty;
  xpReward: number;
  coinReward: number;
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

class MissionMapper implements Mapper<Mission, PrismaMission, MissionDTO> {
  toDomain(raw: PrismaMission): Mission {
    const props: MissionProps = {
      title: raw.title,
      description: raw.description,
      type: raw.type as MissionType,
      difficulty: raw.difficulty as MissionDifficulty,
      xpReward: raw.xpReward,
      coinReward: raw.coinReward,
      startDate: raw.startDate || undefined,
      endDate: raw.endDate || undefined,
      id: raw.id,
      createdAt: raw.createdAt,
      updatedAt: raw.createdAt, // Prisma Mission doesn't have updatedAt
    };

    // Use factory method instead of direct instantiation
    const result = Mission.create(props);
    if (result.isFailure) {
      throw new Error(
        `Failed to create Mission entity: ${result.error.message}`
      );
    }

    return result.value;
  }

  toPersistence(entity: Mission): Omit<PrismaMission, 'createdAt'> {
    return {
      id: entity.id,
      title: entity.title,
      description: entity.description,
      type: entity.type,
      difficulty: entity.difficulty,
      xpReward: entity.xpReward,
      coinReward: entity.coinReward,
      startDate: entity.startDate || null,
      endDate: entity.endDate || null,
    };
  }

  toDTO(entity: Mission): MissionDTO {
    return {
      id: entity.id,
      title: entity.title,
      description: entity.description,
      type: entity.type,
      difficulty: entity.difficulty,
      xpReward: entity.xpReward,
      coinReward: entity.coinReward,
      startDate: entity.startDate,
      endDate: entity.endDate,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}

export const missionMapper = new MissionMapper();
