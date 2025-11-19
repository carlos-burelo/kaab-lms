/**
 * Mission Repository Implementation
 */

import { eventBus } from '@/core/infrastructure/event-bus'
import { DatabaseError } from '@/core/shared/errors'
import { Result } from '@/core/shared/result'
import { prisma } from '@/lib/prisma'
import type { Mission } from '../domain/mission.entity'
import type { IMissionRepository } from '../domain/mission.repository.interface'
import type { MissionDifficulty, MissionType } from '../domain/value-objects'
import { missionMapper } from './mission.mapper'

export class MissionRepository implements IMissionRepository {
  async findById(id: string): Promise<Result<Mission | null>> {
    try {
      const mission = await prisma.mission.findUnique({
        where: { id }
      })

      if (!mission) return Result.ok(null)

      return Result.ok(missionMapper.toDomain(mission))
    } catch (_error) {
      return Result.fail(new DatabaseError('Failed to find mission', _error as Error))
    }
  }

  async findByType(type: MissionType): Promise<Result<Mission[]>> {
    try {
      const missions = await prisma.mission.findMany({
        where: { type }
      })

      return Result.ok(missions.map((mission) => missionMapper.toDomain(mission)))
    } catch (_error) {
      return Result.fail(new DatabaseError('Failed to find missions by type', _error as Error))
    }
  }

  async findByDifficulty(difficulty: MissionDifficulty): Promise<Result<Mission[]>> {
    try {
      const missions = await prisma.mission.findMany({
        where: { difficulty }
      })

      return Result.ok(missions.map((mission) => missionMapper.toDomain(mission)))
    } catch (_error) {
      return Result.fail(new DatabaseError('Failed to find missions by difficulty', _error as Error))
    }
  }

  async findActiveMissions(): Promise<Result<Mission[]>> {
    try {
      const now = new Date()

      const missions = await prisma.mission.findMany({
        where: {
          OR: [
            {
              AND: [{ startDate: { lte: now } }, { endDate: { gte: now } }]
            },
            {
              AND: [{ startDate: null }, { endDate: null }]
            },
            {
              AND: [{ startDate: { lte: now } }, { endDate: null }]
            }
          ]
        }
      })

      return Result.ok(missions.map((mission) => missionMapper.toDomain(mission)))
    } catch (_error) {
      return Result.fail(new DatabaseError('Failed to find active missions', _error as Error))
    }
  }

  async findUserActiveMissions(userId: string): Promise<Result<Mission[]>> {
    try {
      const now = new Date()

      const userMissions = await prisma.userMission.findMany({
        where: {
          userId,
          completedAt: null,
          mission: {
            OR: [
              {
                AND: [{ startDate: { lte: now } }, { endDate: { gte: now } }]
              },
              {
                AND: [{ startDate: null }, { endDate: null }]
              },
              {
                AND: [{ startDate: { lte: now } }, { endDate: null }]
              }
            ]
          }
        },
        include: { mission: true }
      })

      return Result.ok(userMissions.map((um) => missionMapper.toDomain(um.mission)))
    } catch (_error) {
      return Result.fail(new DatabaseError('Failed to find user active missions', _error as Error))
    }
  }

  async findUserCompletedMissions(userId: string): Promise<Result<Mission[]>> {
    try {
      const userMissions = await prisma.userMission.findMany({
        where: {
          userId,
          completedAt: { not: null }
        },
        include: { mission: true }
      })

      return Result.ok(userMissions.map((um) => missionMapper.toDomain(um.mission)))
    } catch (_error) {
      return Result.fail(new DatabaseError('Failed to find user completed missions', _error as Error))
    }
  }

  async userHasCompletedMission(userId: string, missionId: string): Promise<Result<boolean>> {
    try {
      const userMission = await prisma.userMission.findUnique({
        where: {
          userId_missionId: {
            userId,
            missionId
          }
        }
      })

      return Result.ok(userMission !== null && userMission.completedAt !== null)
    } catch (_error) {
      return Result.fail(new DatabaseError('Failed to check user mission', _error as Error))
    }
  }

  async completeMissionForUser(userId: string, missionId: string): Promise<Result<void>> {
    try {
      await prisma.userMission.upsert({
        where: {
          userId_missionId: {
            userId,
            missionId
          }
        },
        create: {
          userId,
          missionId,
          progress: 1,
          completedAt: new Date()
        },
        update: {
          completedAt: new Date()
        }
      })

      return Result.ok(undefined)
    } catch (_error) {
      return Result.fail(new DatabaseError('Failed to complete mission for user', _error as Error))
    }
  }

  async getUserMissionProgress(
    userId: string,
    missionId: string
  ): Promise<Result<{ progress: number; completedAt?: Date } | null>> {
    try {
      const userMission = await prisma.userMission.findUnique({
        where: {
          userId_missionId: {
            userId,
            missionId
          }
        }
      })

      if (!userMission) return Result.ok(null)

      return Result.ok({
        progress: userMission.progress,
        completedAt: userMission.completedAt || undefined
      })
    } catch (_error) {
      return Result.fail(new DatabaseError('Failed to get user mission progress', _error as Error))
    }
  }

  async save(entity: Mission): Promise<Result<Mission>> {
    try {
      const model = missionMapper.toPersistence(entity)

      const saved = await prisma.mission.upsert({
        where: { id: entity.id },
        create: model,
        update: model
      })

      // Publish domain events
      for (const event of entity.domainEvents) {
        await eventBus.publish(event)
      }
      entity.clearEvents()

      return Result.ok(missionMapper.toDomain(saved))
    } catch (_error) {
      return Result.fail(new DatabaseError('Failed to save mission', _error as Error))
    }
  }

  async delete(id: string): Promise<Result<void>> {
    try {
      await prisma.mission.delete({
        where: { id }
      })

      return Result.ok(undefined)
    } catch (_error) {
      return Result.fail(new DatabaseError('Failed to delete mission', _error as Error))
    }
  }

  async exists(id: string): Promise<Result<boolean>> {
    try {
      const count = await prisma.mission.count({
        where: { id }
      })

      return Result.ok(count > 0)
    } catch (_error) {
      return Result.fail(new DatabaseError('Failed to check mission existence', _error as Error))
    }
  }
}
