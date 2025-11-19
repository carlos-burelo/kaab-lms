/**
 * UserGamification Mapper
 */

import type { Mapper } from '@/core/shared/mapper.interface';
import {
  UserGamification,
  type UserGamificationProps,
} from '../domain/user-gamification.entity';
import type { UserGamification as PrismaUserGamification } from '@prisma/client';

export interface UserGamificationDTO {
  id: string;
  userId: string;
  xp: number;
  level: number;
  coins: number;
  totalBadges: number;
  streak: number;
  lastActivity?: Date;
  xpToNextLevel: number;
  levelProgress: number;
  createdAt: Date;
  updatedAt: Date;
}

class UserGamificationMapper
  implements
    Mapper<UserGamification, PrismaUserGamification, UserGamificationDTO>
{
  toDomain(raw: PrismaUserGamification): UserGamification {
    const props: UserGamificationProps = {
      userId: raw.userId,
      xp: raw.xp,
      level: raw.level,
      coins: raw.coins,
      totalBadges: raw.totalBadges,
      streak: raw.streak,
      lastActivity: raw.lastActivity || undefined,
      id: raw.id,
      createdAt: new Date(), // Prisma UserGamification doesn't have createdAt
      updatedAt: new Date(), // Prisma UserGamification doesn't have updatedAt
    };

    // Use factory method instead of direct instantiation
    const result = UserGamification.create(props);
    if (result.isFailure) {
      throw new Error(
        `Failed to create UserGamification entity: ${result.error.message}`
      );
    }

    return result.value;
  }

  toPersistence(
    entity: UserGamification
  ): Omit<PrismaUserGamification, 'createdAt' | 'updatedAt'> {
    return {
      id: entity.id,
      userId: entity.userId,
      xp: entity.xp,
      level: entity.level,
      coins: entity.coins,
      totalBadges: entity.totalBadges,
      streak: entity.streak,
      lastActivity: entity.lastActivity || null,
    };
  }

  toDTO(entity: UserGamification): UserGamificationDTO {
    return {
      id: entity.id,
      userId: entity.userId,
      xp: entity.xp,
      level: entity.level,
      coins: entity.coins,
      totalBadges: entity.totalBadges,
      streak: entity.streak,
      lastActivity: entity.lastActivity,
      xpToNextLevel: entity.getXpToNextLevel(),
      levelProgress: entity.getLevelProgress(),
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}

export const userGamificationMapper = new UserGamificationMapper();
