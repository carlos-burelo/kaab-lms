/**
 * Badge Mapper
 */

import { Mapper } from '@/core/shared/mapper.interface';
import { Badge, BadgeProps } from '../domain/badge.entity';
import { BadgeRarity } from '../domain/value-objects';
import type { Badge as PrismaBadge } from '@prisma/client';

export interface BadgeDTO {
  id: string;
  name: string;
  description: string;
  imageId?: string;
  rarity: BadgeRarity;
  condition: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

class BadgeMapper implements Mapper<Badge, PrismaBadge, BadgeDTO> {
  toDomain(raw: PrismaBadge): Badge {
    const props: BadgeProps = {
      name: raw.name,
      description: raw.description,
      imageId: raw.imageId || undefined,
      rarity: raw.rarity as BadgeRarity,
      condition: raw.condition as Record<string, any>,
      id: raw.id,
      createdAt: raw.createdAt,
      updatedAt: raw.createdAt, // Prisma Badge doesn't have updatedAt
    };

    // Use factory method instead of direct instantiation
    const result = Badge.create(props);
    if (result.isFailure) {
      throw new Error(`Failed to create Badge entity: ${result.error.message}`);
    }

    return result.value;
  }

  toPersistence(entity: Badge): Omit<PrismaBadge, 'createdAt'> {
    return {
      id: entity.id,
      name: entity.name,
      description: entity.description,
      imageId: entity.imageId || null,
      rarity: entity.rarity,
      condition: entity.condition,
    };
  }

  toDTO(entity: Badge): BadgeDTO {
    return {
      id: entity.id,
      name: entity.name,
      description: entity.description,
      imageId: entity.imageId,
      rarity: entity.rarity,
      condition: entity.condition,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}

export const badgeMapper = new BadgeMapper();
