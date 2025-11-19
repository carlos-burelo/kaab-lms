/**
 * Achievement Repository Implementation
 */

import { Result } from '@/core/shared/result';
import { DatabaseError } from '@/core/shared/errors';
import { prisma } from '@/lib/prisma';
import type { Achievement } from '../domain/achievement.entity';
import type { IAchievementRepository } from '../domain/achievement.repository.interface';
import type { AchievementCategory } from '../domain/value-objects';
import { achievementMapper } from './achievement.mapper';
import { eventBus } from '@/core/infrastructure/event-bus';

export class AchievementRepository implements IAchievementRepository {
  async findById(id: string): Promise<Result<Achievement | null>> {
    try {
      const achievement = await prisma.achievement.findUnique({
        where: { id },
      });

      if (!achievement) return Result.ok(null);

      return Result.ok(achievementMapper.toDomain(achievement));
    } catch (error) {
      return Result.fail(
        new DatabaseError('Failed to find achievement', error as Error)
      );
    }
  }

  async findByCategory(
    category: AchievementCategory
  ): Promise<Result<Achievement[]>> {
    try {
      const achievements = await prisma.achievement.findMany({
        where: { category },
      });

      return Result.ok(
        achievements.map((achievement) =>
          achievementMapper.toDomain(achievement)
        )
      );
    } catch (error) {
      return Result.fail(
        new DatabaseError(
          'Failed to find achievements by category',
          error as Error
        )
      );
    }
  }

  async findAllAchievements(): Promise<Result<Achievement[]>> {
    try {
      const achievements = await prisma.achievement.findMany({
        orderBy: { createdAt: 'desc' },
      });

      return Result.ok(
        achievements.map((achievement) =>
          achievementMapper.toDomain(achievement)
        )
      );
    } catch (error) {
      return Result.fail(
        new DatabaseError('Failed to find all achievements', error as Error)
      );
    }
  }

  async getUserAchievements(
    userId: string
  ): Promise<
    Result<
      Array<{
        achievement: Achievement;
        progress: number;
        unlockedAt?: Date;
      }>
    >
  > {
    try {
      const userAchievements = await prisma.userAchievement.findMany({
        where: { userId },
        include: { achievement: true },
      });

      return Result.ok(
        userAchievements.map((ua) => ({
          achievement: achievementMapper.toDomain(ua.achievement),
          progress: ua.progress,
          unlockedAt: ua.unlockedAt || undefined,
        }))
      );
    } catch (error) {
      return Result.fail(
        new DatabaseError('Failed to get user achievements', error as Error)
      );
    }
  }

  async userHasAchievement(
    userId: string,
    achievementId: string
  ): Promise<Result<boolean>> {
    try {
      const userAchievement = await prisma.userAchievement.findUnique({
        where: {
          userId_achievementId: {
            userId,
            achievementId,
          },
        },
      });

      return Result.ok(
        userAchievement !== null && userAchievement.unlockedAt !== null
      );
    } catch (error) {
      return Result.fail(
        new DatabaseError('Failed to check user achievement', error as Error)
      );
    }
  }

  async updateUserAchievementProgress(
    userId: string,
    achievementId: string,
    progress: number
  ): Promise<Result<void>> {
    try {
      await prisma.userAchievement.upsert({
        where: {
          userId_achievementId: {
            userId,
            achievementId,
          },
        },
        create: {
          userId,
          achievementId,
          progress,
        },
        update: {
          progress,
        },
      });

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(
        new DatabaseError(
          'Failed to update user achievement progress',
          error as Error
        )
      );
    }
  }

  async unlockAchievementForUser(
    userId: string,
    achievementId: string
  ): Promise<Result<void>> {
    try {
      await prisma.userAchievement.upsert({
        where: {
          userId_achievementId: {
            userId,
            achievementId,
          },
        },
        create: {
          userId,
          achievementId,
          progress: 1,
          unlockedAt: new Date(),
        },
        update: {
          unlockedAt: new Date(),
        },
      });

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(
        new DatabaseError(
          'Failed to unlock achievement for user',
          error as Error
        )
      );
    }
  }

  async save(entity: Achievement): Promise<Result<Achievement>> {
    try {
      const model = achievementMapper.toPersistence(entity);

      const saved = await prisma.achievement.upsert({
        where: { id: entity.id },
        create: model,
        update: model,
      });

      // Publish domain events
      for (const event of entity.domainEvents) {
        await eventBus.publish(event);
      }
      entity.clearEvents();

      return Result.ok(achievementMapper.toDomain(saved));
    } catch (error) {
      return Result.fail(
        new DatabaseError('Failed to save achievement', error as Error)
      );
    }
  }

  async delete(id: string): Promise<Result<void>> {
    try {
      await prisma.achievement.delete({
        where: { id },
      });

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(
        new DatabaseError('Failed to delete achievement', error as Error)
      );
    }
  }

  async exists(id: string): Promise<Result<boolean>> {
    try {
      const count = await prisma.achievement.count({
        where: { id },
      });

      return Result.ok(count > 0);
    } catch (error) {
      return Result.fail(
        new DatabaseError(
          'Failed to check achievement existence',
          error as Error
        )
      );
    }
  }
}
