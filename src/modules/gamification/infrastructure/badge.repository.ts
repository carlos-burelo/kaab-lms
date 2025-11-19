/**
 * Badge Repository Implementation
 */

import { eventBus } from '@/core/infrastructure/event-bus'
import { DatabaseError } from '@/core/shared/errors'
import { Result } from '@/core/shared/result'
import { prisma } from '@/lib/prisma'
import type { Badge } from '../domain/badge.entity'
import type { IBadgeRepository } from '../domain/badge.repository.interface'
import type { BadgeRarity } from '../domain/value-objects'
import { badgeMapper } from './badge.mapper'

export class BadgeRepository implements IBadgeRepository {
  async findById(id: string): Promise<Result<Badge | null>> {
    try {
      const badge = await prisma.badge.findUnique({
        where: { id }
      })

      if (!badge) return Result.ok(null)

      return Result.ok(badgeMapper.toDomain(badge))
    } catch (_error) {
      return Result.fail(new DatabaseError('Failed to find badge', _error as Error))
    }
  }

  async findByRarity(rarity: BadgeRarity): Promise<Result<Badge[]>> {
    try {
      const badges = await prisma.badge.findMany({
        where: { rarity }
      })

      return Result.ok(badges.map((badge) => badgeMapper.toDomain(badge)))
    } catch (_error) {
      return Result.fail(new DatabaseError('Failed to find badges by rarity', _error as Error))
    }
  }

  async findAllBadges(): Promise<Result<Badge[]>> {
    try {
      const badges = await prisma.badge.findMany({
        orderBy: { createdAt: 'desc' }
      })

      return Result.ok(badges.map((badge) => badgeMapper.toDomain(badge)))
    } catch (_error) {
      return Result.fail(new DatabaseError('Failed to find all badges', _error as Error))
    }
  }

  async userHasBadge(userId: string, badgeId: string): Promise<Result<boolean>> {
    try {
      const count = await prisma.userBadge.count({
        where: {
          userId,
          badgeId
        }
      })

      return Result.ok(count > 0)
    } catch (_error) {
      return Result.fail(new DatabaseError('Failed to check user badge', _error as Error))
    }
  }

  async getUserBadges(userId: string): Promise<Result<Badge[]>> {
    try {
      const userBadges = await prisma.userBadge.findMany({
        where: { userId },
        include: { badge: true }
      })

      return Result.ok(userBadges.map((ub) => badgeMapper.toDomain(ub.badge)))
    } catch (_error) {
      return Result.fail(new DatabaseError('Failed to get user badges', _error as Error))
    }
  }

  async awardBadgeToUser(userId: string, badgeId: string): Promise<Result<void>> {
    try {
      await prisma.userBadge.create({
        data: {
          userId,
          badgeId,
          awardedAt: new Date()
        }
      })

      return Result.ok(undefined)
    } catch (_error) {
      return Result.fail(new DatabaseError('Failed to award badge to user', _error as Error))
    }
  }

  async save(entity: Badge): Promise<Result<Badge>> {
    try {
      const model = badgeMapper.toPersistence(entity)

      const saved = await prisma.badge.upsert({
        where: { id: entity.id },
        create: model,
        update: model
      })

      // Publish domain events
      for (const event of entity.domainEvents) {
        await eventBus.publish(event)
      }
      entity.clearEvents()

      return Result.ok(badgeMapper.toDomain(saved))
    } catch (_error) {
      return Result.fail(new DatabaseError('Failed to save badge', _error as Error))
    }
  }

  async delete(id: string): Promise<Result<void>> {
    try {
      await prisma.badge.delete({
        where: { id }
      })

      return Result.ok(undefined)
    } catch (_error) {
      return Result.fail(new DatabaseError('Failed to delete badge', _error as Error))
    }
  }

  async exists(id: string): Promise<Result<boolean>> {
    try {
      const count = await prisma.badge.count({
        where: { id }
      })

      return Result.ok(count > 0)
    } catch (_error) {
      return Result.fail(new DatabaseError('Failed to check badge existence', _error as Error))
    }
  }
}
