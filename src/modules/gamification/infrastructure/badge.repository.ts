/**
 * Badge Repository Implementation
 */

import { Result } from '@/core/shared/result';
import { DatabaseError } from '@/core/shared/errors';
import { prisma } from '@/lib/prisma';
import { Badge } from '../domain/badge.entity';
import { IBadgeRepository } from '../domain/badge.repository.interface';
import { BadgeRarity } from '../domain/value-objects';
import { badgeMapper } from './badge.mapper';
import { eventBus } from '@/core/infrastructure/event-bus';

export class BadgeRepository implements IBadgeRepository {
  async findById(id: string): Promise<Result<Badge | null>> {
    try {
      const badge = await prisma.badge.findUnique({
        where: { id },
      });

      if (!badge) return Result.ok(null);

      return Result.ok(badgeMapper.toDomain(badge));
    } catch (error) {
      return Result.fail(
        new DatabaseError('Failed to find badge', error as Error)
      );
    }
  }

  async findByRarity(rarity: BadgeRarity): Promise<Result<Badge[]>> {
    try {
      const badges = await prisma.badge.findMany({
        where: { rarity },
      });

      return Result.ok(badges.map((badge) => badgeMapper.toDomain(badge)));
    } catch (error) {
      return Result.fail(
        new DatabaseError('Failed to find badges by rarity', error as Error)
      );
    }
  }

  async findAllBadges(): Promise<Result<Badge[]>> {
    try {
      const badges = await prisma.badge.findMany({
        orderBy: { createdAt: 'desc' },
      });

      return Result.ok(badges.map((badge) => badgeMapper.toDomain(badge)));
    } catch (error) {
      return Result.fail(
        new DatabaseError('Failed to find all badges', error as Error)
      );
    }
  }

  async userHasBadge(
    userId: string,
    badgeId: string
  ): Promise<Result<boolean>> {
    try {
      const count = await prisma.userBadge.count({
        where: {
          userId,
          badgeId,
        },
      });

      return Result.ok(count > 0);
    } catch (error) {
      return Result.fail(
        new DatabaseError('Failed to check user badge', error as Error)
      );
    }
  }

  async getUserBadges(userId: string): Promise<Result<Badge[]>> {
    try {
      const userBadges = await prisma.userBadge.findMany({
        where: { userId },
        include: { badge: true },
      });

      return Result.ok(
        userBadges.map((ub) => badgeMapper.toDomain(ub.badge))
      );
    } catch (error) {
      return Result.fail(
        new DatabaseError('Failed to get user badges', error as Error)
      );
    }
  }

  async awardBadgeToUser(
    userId: string,
    badgeId: string
  ): Promise<Result<void>> {
    try {
      await prisma.userBadge.create({
        data: {
          userId,
          badgeId,
          awardedAt: new Date(),
        },
      });

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(
        new DatabaseError('Failed to award badge to user', error as Error)
      );
    }
  }

  async save(entity: Badge): Promise<Result<Badge>> {
    try {
      const model = badgeMapper.toPersistence(entity);

      const saved = await prisma.badge.upsert({
        where: { id: entity.id },
        create: model,
        update: model,
      });

      // Publish domain events
      for (const event of entity.domainEvents) {
        await eventBus.publish(event);
      }
      entity.clearEvents();

      return Result.ok(badgeMapper.toDomain(saved));
    } catch (error) {
      return Result.fail(
        new DatabaseError('Failed to save badge', error as Error)
      );
    }
  }

  async delete(id: string): Promise<Result<void>> {
    try {
      await prisma.badge.delete({
        where: { id },
      });

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(
        new DatabaseError('Failed to delete badge', error as Error)
      );
    }
  }

  async exists(id: string): Promise<Result<boolean>> {
    try {
      const count = await prisma.badge.count({
        where: { id },
      });

      return Result.ok(count > 0);
    } catch (error) {
      return Result.fail(
        new DatabaseError('Failed to check badge existence', error as Error)
      );
    }
  }
}
