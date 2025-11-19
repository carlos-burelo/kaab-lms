/**
 * Achievement Mapper
 */

import type { Achievement as PrismaAchievement } from '@prisma/client'
import type { Mapper } from '@/core/shared/mapper.interface'
import { Achievement, type AchievementProps } from '../domain/achievement.entity'
import type { AchievementCategory } from '../domain/value-objects'

export interface AchievementDTO {
  id: string
  name: string
  description: string
  category: AchievementCategory
  imageId?: string
  xpReward: number
  coinReward: number
  maxProgress: number
  createdAt: Date
  updatedAt: Date
}

class AchievementMapper implements Mapper<Achievement, PrismaAchievement, AchievementDTO> {
  toDomain(raw: PrismaAchievement): Achievement {
    const props: AchievementProps = {
      name: raw.name,
      description: raw.description,
      category: raw.category as AchievementCategory,
      imageId: raw.imageId || undefined,
      xpReward: raw.xpReward,
      coinReward: raw.coinReward,
      maxProgress: raw.maxProgress,
      id: raw.id,
      createdAt: raw.createdAt,
      updatedAt: raw.createdAt // Prisma Achievement doesn't have updatedAt
    }

    // Use factory method instead of direct instantiation
    const result = Achievement.create(props)
    if (result.isFailure) {
      throw new Error(`Failed to create Achievement entity: ${result.error.message}`)
    }

    return result.value
  }

  toPersistence(entity: Achievement): Omit<PrismaAchievement, 'createdAt'> {
    return {
      id: entity.id,
      name: entity.name,
      description: entity.description,
      category: entity.category,
      imageId: entity.imageId || null,
      xpReward: entity.xpReward,
      coinReward: entity.coinReward,
      maxProgress: entity.maxProgress
    }
  }

  toDTO(entity: Achievement): AchievementDTO {
    return {
      id: entity.id,
      name: entity.name,
      description: entity.description,
      category: entity.category,
      imageId: entity.imageId,
      xpReward: entity.xpReward,
      coinReward: entity.coinReward,
      maxProgress: entity.maxProgress,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt
    }
  }
}

export const achievementMapper = new AchievementMapper()
