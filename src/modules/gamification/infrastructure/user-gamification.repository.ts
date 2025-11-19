/**
 * UserGamification Repository Implementation
 */

import { Result } from '@/core/shared/result';
import { DatabaseError } from '@/core/shared/errors';
import { prisma } from '@/lib/prisma';
import { UserGamification } from '../domain/user-gamification.entity';
import type { IUserGamificationRepository } from '../domain/user-gamification.repository.interface';
import { userGamificationMapper } from './user-gamification.mapper';
import { eventBus } from '@/core/infrastructure/event-bus';

export class UserGamificationRepository
  implements IUserGamificationRepository
{
  async findById(id: string): Promise<Result<UserGamification | null>> {
    try {
      const userGamification = await prisma.userGamification.findUnique({
        where: { id },
      });

      if (!userGamification) return Result.ok(null);

      return Result.ok(userGamificationMapper.toDomain(userGamification));
    } catch (error) {
      return Result.fail(
        new DatabaseError(
          'Failed to find user gamification',
          error as Error
        )
      );
    }
  }

  async findByUserId(
    userId: string
  ): Promise<Result<UserGamification | null>> {
    try {
      const userGamification = await prisma.userGamification.findUnique({
        where: { userId },
      });

      if (!userGamification) return Result.ok(null);

      return Result.ok(userGamificationMapper.toDomain(userGamification));
    } catch (error) {
      return Result.fail(
        new DatabaseError(
          'Failed to find user gamification by user ID',
          error as Error
        )
      );
    }
  }

  async getOrCreate(userId: string): Promise<Result<UserGamification>> {
    try {
      // Try to find existing
      const existing = await prisma.userGamification.findUnique({
        where: { userId },
      });

      if (existing) {
        return Result.ok(userGamificationMapper.toDomain(existing));
      }

      // Create new
      const userGamificationResult = UserGamification.create({ userId });

      if (userGamificationResult.isFailure) {
        return Result.fail(userGamificationResult.error);
      }

      const created = await prisma.userGamification.create({
        data: {
          userId,
          xp: 0,
          level: 1,
          coins: 0,
          totalBadges: 0,
          streak: 0,
        },
      });

      return Result.ok(userGamificationMapper.toDomain(created));
    } catch (error) {
      return Result.fail(
        new DatabaseError(
          'Failed to get or create user gamification',
          error as Error
        )
      );
    }
  }

  async getLeaderboard(
    limit: number,
    offset: number
  ): Promise<
    Result<
      Array<{
        user: UserGamification;
        rank: number;
      }>
    >
  > {
    try {
      const users = await prisma.userGamification.findMany({
        orderBy: { xp: 'desc' },
        take: limit,
        skip: offset,
      });

      return Result.ok(
        users.map((user, index) => ({
          user: userGamificationMapper.toDomain(user),
          rank: offset + index + 1,
        }))
      );
    } catch (error) {
      return Result.fail(
        new DatabaseError('Failed to get leaderboard', error as Error)
      );
    }
  }

  async getUserRank(userId: string): Promise<Result<number>> {
    try {
      const userGamification = await prisma.userGamification.findUnique({
        where: { userId },
      });

      if (!userGamification) {
        return Result.ok(0);
      }

      const count = await prisma.userGamification.count({
        where: {
          xp: { gt: userGamification.xp },
        },
      });

      return Result.ok(count + 1);
    } catch (error) {
      return Result.fail(
        new DatabaseError('Failed to get user rank', error as Error)
      );
    }
  }

  async findByLevelRange(
    minLevel: number,
    maxLevel: number
  ): Promise<Result<UserGamification[]>> {
    try {
      const users = await prisma.userGamification.findMany({
        where: {
          level: {
            gte: minLevel,
            lte: maxLevel,
          },
        },
        orderBy: { xp: 'desc' },
      });

      return Result.ok(
        users.map((user) => userGamificationMapper.toDomain(user))
      );
    } catch (error) {
      return Result.fail(
        new DatabaseError(
          'Failed to find users by level range',
          error as Error
        )
      );
    }
  }

  async getTotalUsersCount(): Promise<Result<number>> {
    try {
      const count = await prisma.userGamification.count();

      return Result.ok(count);
    } catch (error) {
      return Result.fail(
        new DatabaseError('Failed to get total users count', error as Error)
      );
    }
  }

  async save(entity: UserGamification): Promise<Result<UserGamification>> {
    try {
      const model = userGamificationMapper.toPersistence(entity);

      const saved = await prisma.userGamification.upsert({
        where: { id: entity.id },
        create: model,
        update: model,
      });

      // Publish domain events
      for (const event of entity.domainEvents) {
        await eventBus.publish(event);
      }
      entity.clearEvents();

      return Result.ok(userGamificationMapper.toDomain(saved));
    } catch (error) {
      return Result.fail(
        new DatabaseError('Failed to save user gamification', error as Error)
      );
    }
  }

  async delete(id: string): Promise<Result<void>> {
    try {
      await prisma.userGamification.delete({
        where: { id },
      });

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(
        new DatabaseError(
          'Failed to delete user gamification',
          error as Error
        )
      );
    }
  }

  async exists(id: string): Promise<Result<boolean>> {
    try {
      const count = await prisma.userGamification.count({
        where: { id },
      });

      return Result.ok(count > 0);
    } catch (error) {
      return Result.fail(
        new DatabaseError(
          'Failed to check user gamification existence',
          error as Error
        )
      );
    }
  }
}
