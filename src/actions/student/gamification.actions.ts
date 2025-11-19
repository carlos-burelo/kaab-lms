'use server'

import { z } from 'zod'
import { createAction } from '@/actions/_shared/action-builder'
import { idSchema } from '@/actions/_shared/validators'
import { err, ok } from '@/core/shared/result'
import { studentRepository } from '@/database/repositories/student.repository'

// ============ SCHEMAS ============

const _addXpSchema = z.object({
  points: z.number().int().positive(),
  sourceType: z.string(),
  sourceId: z.string()
})

const _addCoinsSchema = z.object({
  amount: z.number().int().positive()
})

const awardBadgeSchema = z.object({
  badgeId: idSchema
})

const completeAchievementSchema = z.object({
  achievementId: idSchema
})

const acceptMissionSchema = z.object({
  missionId: idSchema
})

const completeMissionSchema = z.object({
  missionId: idSchema
})

const claimRewardSchema = z.object({
  rewardId: idSchema
})

const leaderboardSchema = z.object({
  limit: z.number().int().min(1).max(500).optional().default(100)
})

// ============ GET GAMIFICATION PROFILE ============

/**
 * Obtiene el perfil de gamificación del estudiante (XP, nivel, coins)
 */
export const getGamificationProfile = createAction({
  name: 'student.getGamificationProfile',
  requireAuth: true,
  allowedRoles: ['STUDENT'],
  execute: async (_, context) => {
    try {
      const profile = await studentRepository.getGamificationProfile(context.userId)

      if (!profile) {
        return err(new Error('Perfil de gamificación no encontrado'))
      }

      return ok(profile)
    } catch (_error) {
      return err(new Error('Error al obtener perfil de gamificación'))
    }
  }
})

// ============ GET XP FOR NEXT LEVEL ============

/**
 * Obtiene el XP requerido para el siguiente nivel
 */
export const getXpForNextLevel = createAction({
  name: 'student.getXpForNextLevel',
  requireAuth: true,
  allowedRoles: ['STUDENT'],
  execute: async (_, context) => {
    try {
      const xpInfo = await studentRepository.getXpForNextLevel(context.userId)

      if (!xpInfo) {
        return err(new Error('No se pudo calcular XP para el siguiente nivel'))
      }

      return ok(xpInfo)
    } catch (_error) {
      return err(new Error('Error al calcular XP para siguiente nivel'))
    }
  }
})

// ============ GET ACHIEVEMENTS ============

/**
 * Obtiene todos los logros del estudiante
 */
export const getAchievements = createAction({
  name: 'student.getAchievements',
  requireAuth: true,
  allowedRoles: ['STUDENT'],
  execute: async (_, context) => {
    try {
      const achievements = await studentRepository.getAchievements(context.userId)
      return ok(achievements || [])
    } catch (_error) {
      return err(new Error('Error al obtener logros'))
    }
  }
})

// ============ GET BADGES ============

/**
 * Obtiene todas las insignias del estudiante
 */
export const getBadges = createAction({
  name: 'student.getBadges',
  requireAuth: true,
  allowedRoles: ['STUDENT'],
  execute: async (_, context) => {
    try {
      const badges = await studentRepository.getBadges(context.userId)
      return ok(badges || [])
    } catch (_error) {
      return err(new Error('Error al obtener insignias'))
    }
  }
})

// ============ GET ACTIVE MISSIONS ============

/**
 * Obtiene misiones activas disponibles para el estudiante
 */
export const getActiveMissions = createAction({
  name: 'student.getActiveMissions',
  requireAuth: true,
  allowedRoles: ['STUDENT'],
  execute: async (_, context) => {
    try {
      const missions = await studentRepository.getActiveMissions(context.userId)
      return ok(missions || [])
    } catch (_error) {
      return err(new Error('Error al obtener misiones activas'))
    }
  }
})

// ============ GET COMPLETED MISSIONS ============

/**
 * Obtiene misiones completadas por el estudiante
 */
export const getCompletedMissions = createAction({
  name: 'student.getCompletedMissions',
  requireAuth: true,
  allowedRoles: ['STUDENT'],
  execute: async (_, context) => {
    try {
      const missions = await studentRepository.getCompletedMissions(context.userId)
      return ok(missions || [])
    } catch (_error) {
      return err(new Error('Error al obtener misiones completadas'))
    }
  }
})

// ============ ACCEPT MISSION ============

/**
 * Acepta una misión
 */
export const acceptMission = createAction({
  name: 'student.acceptMission',
  schema: acceptMissionSchema,
  requireAuth: true,
  allowedRoles: ['STUDENT'],
  execute: async (input, context) => {
    try {
      const result = await studentRepository.acceptMission(context.userId, input.missionId)

      if (!result.success) {
        return err(new Error(result.message))
      }

      return ok({ message: result.message })
    } catch (_error) {
      return err(new Error('Error al aceptar misión'))
    }
  }
})

// ============ COMPLETE MISSION ============

/**
 * Completa una misión y recibe recompensas
 */
export const completeMission = createAction({
  name: 'student.completeMission',
  schema: completeMissionSchema,
  requireAuth: true,
  allowedRoles: ['STUDENT'],
  execute: async (input, context) => {
    try {
      const result = await studentRepository.completeMission(context.userId, input.missionId)

      if (!result.success) {
        return err(new Error(result.message))
      }

      return ok({ message: result.message })
    } catch (_error) {
      return err(new Error('Error al completar misión'))
    }
  }
})

// ============ GET AVAILABLE REWARDS ============

/**
 * Obtiene recompensas disponibles en la tienda
 */
export const getAvailableRewards = createAction({
  name: 'student.getAvailableRewards',
  requireAuth: true,
  allowedRoles: ['STUDENT'],
  execute: async (_, context) => {
    try {
      const rewards = await studentRepository.getAvailableRewards(context.userId)
      return ok(rewards || [])
    } catch (_error) {
      return err(new Error('Error al obtener recompensas disponibles'))
    }
  }
})

// ============ GET CLAIMED REWARDS ============

/**
 * Obtiene recompensas reclamadas por el estudiante
 */
export const getClaimedRewards = createAction({
  name: 'student.getClaimedRewards',
  requireAuth: true,
  allowedRoles: ['STUDENT'],
  execute: async (_, context) => {
    try {
      const rewards = await studentRepository.getClaimedRewards(context.userId)
      return ok(rewards || [])
    } catch (_error) {
      return err(new Error('Error al obtener recompensas reclamadas'))
    }
  }
})

// ============ CLAIM REWARD ============

/**
 * Reclama una recompensa gastando coins
 */
export const claimReward = createAction({
  name: 'student.claimReward',
  schema: claimRewardSchema,
  requireAuth: true,
  allowedRoles: ['STUDENT'],
  execute: async (input, context) => {
    try {
      const result = await studentRepository.claimReward(context.userId, input.rewardId)

      if (!result.success) {
        return err(new Error(result.message))
      }

      return ok({ message: result.message })
    } catch (_error) {
      return err(new Error('Error al reclamar recompensa'))
    }
  }
})

// ============ COMPLETE ACHIEVEMENT ============

/**
 * Marca un logro como completado
 */
export const completeAchievement = createAction({
  name: 'student.completeAchievement',
  schema: completeAchievementSchema,
  requireAuth: true,
  allowedRoles: ['STUDENT'],
  execute: async (input, context) => {
    try {
      const result = await studentRepository.completeAchievement(context.userId, input.achievementId)

      if (!result.success) {
        return err(new Error(result.message))
      }

      return ok({ message: result.message })
    } catch (_error) {
      return err(new Error('Error al completar logro'))
    }
  }
})

// ============ AWARD BADGE ============

/**
 * Otorga una insignia al estudiante (normalmente llamado por el sistema)
 */
export const awardBadge = createAction({
  name: 'student.awardBadge',
  schema: awardBadgeSchema,
  requireAuth: true,
  allowedRoles: ['STUDENT'],
  execute: async (input, context) => {
    try {
      const result = await studentRepository.awardBadge(context.userId, input.badgeId)

      if (!result.success) {
        return err(new Error(result.message))
      }

      return ok({ message: result.message })
    } catch (_error) {
      return err(new Error('Error al otorgar insignia'))
    }
  }
})

// ============ GET LEADERBOARD ============

/**
 * Obtiene el ranking de estudiantes
 */
export const getLeaderboard = createAction({
  name: 'student.getLeaderboard',
  schema: leaderboardSchema.optional(),
  requireAuth: false, // Público
  execute: async (input) => {
    try {
      const limit = input?.limit || 100
      const leaderboard = await studentRepository.getLeaderboard(limit)

      return ok(leaderboard || [])
    } catch (_error) {
      return err(new Error('Error al obtener ranking'))
    }
  }
})
