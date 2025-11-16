'use server'

import { revalidatePath } from 'next/cache'
import { studentRepository } from '@/database/repositories'
import { getSession } from '@/lib/auth'

/**
 * Agrega XP a un estudiante
 * Solo el sistema (authenticated) puede llamar esto
 */
export async function addXpAction(points: number, sourceType: string, sourceId: string) {
  try {
    const session = await getSession()
    if (!session?.id) {
      return { success: false, error: 'No autenticado' }
    }

    const result = await studentRepository.addXp(session.id, points, sourceType, sourceId)

    revalidatePath('/estudiante/gamificacion')
    revalidatePath('/estudiante')

    return { success: true, data: result }
  } catch (error) {
    console.error('[addXpAction]', error)
    return { success: false, error: 'Error al agregar XP' }
  }
}

/**
 * Agrega coins (moneda virtual) a un estudiante
 */
export async function addCoinsAction(amount: number) {
  try {
    const session = await getSession()
    if (!session?.id) {
      return { success: false, error: 'No autenticado' }
    }

    const result = await studentRepository.addCoins(session.id, amount)

    revalidatePath('/estudiante/gamificacion')

    return { success: true, data: result }
  } catch (error) {
    console.error('[addCoinsAction]', error)
    return { success: false, error: 'Error al agregar coins' }
  }
}

/**
 * Otorga una insignia a un estudiante
 */
export async function awardBadgeAction(badgeId: string) {
  try {
    const session = await getSession()
    if (!session?.id) {
      return { success: false, error: 'No autenticado' }
    }

    const result = await studentRepository.awardBadge(session.id, badgeId)

    revalidatePath('/estudiante/gamificacion/insignias')
    revalidatePath('/estudiante/gamificacion')

    return result
  } catch (error) {
    console.error('[awardBadgeAction]', error)
    return { success: false, error: 'Error al otorgar insignia' }
  }
}

/**
 * Marca un logro como completado
 */
export async function completeAchievementAction(achievementId: string) {
  try {
    const session = await getSession()
    if (!session?.id) {
      return { success: false, error: 'No autenticado' }
    }

    const result = await studentRepository.completeAchievement(session.id, achievementId)

    revalidatePath('/estudiante/gamificacion/logros')
    revalidatePath('/estudiante/gamificacion')

    return result
  } catch (error) {
    console.error('[completeAchievementAction]', error)
    return { success: false, error: 'Error al completar logro' }
  }
}

/**
 * Acepta una misión
 */
export async function acceptMissionAction(missionId: string) {
  try {
    const session = await getSession()
    if (!session?.id) {
      return { success: false, error: 'No autenticado' }
    }

    const result = await studentRepository.acceptMission(session.id, missionId)

    revalidatePath('/estudiante/gamificacion/misiones')
    revalidatePath('/estudiante/gamificacion')

    return result
  } catch (error) {
    console.error('[acceptMissionAction]', error)
    return { success: false, error: 'Error al aceptar misión' }
  }
}

/**
 * Completa una misión
 */
export async function completeMissionAction(missionId: string) {
  try {
    const session = await getSession()
    if (!session?.id) {
      return { success: false, error: 'No autenticado' }
    }

    const result = await studentRepository.completeMission(session.id, missionId)

    revalidatePath('/estudiante/gamificacion/misiones')
    revalidatePath('/estudiante/gamificacion')

    return result
  } catch (error) {
    console.error('[completeMissionAction]', error)
    return { success: false, error: 'Error al completar misión' }
  }
}

/**
 * Reclamar una recompensa de la tienda
 */
export async function claimRewardAction(rewardId: string) {
  try {
    const session = await getSession()
    if (!session?.id) {
      return { success: false, error: 'No autenticado' }
    }

    const result = await studentRepository.claimReward(session.id, rewardId)

    revalidatePath('/estudiante/gamificacion/tienda')
    revalidatePath('/estudiante/gamificacion')

    return result
  } catch (error) {
    console.error('[claimRewardAction]', error)
    return { success: false, error: 'Error al reclamar recompensa' }
  }
}

/**
 * Obtiene el perfil de gamificación del usuario autenticado
 */
export async function getGamificationProfileAction() {
  try {
    const session = await getSession()
    if (!session?.id) {
      return { success: false, error: 'No autenticado', data: null }
    }

    const profile = await studentRepository.getGamificationProfile(session.id)

    return { success: true, data: profile }
  } catch (error) {
    console.error('[getGamificationProfileAction]', error)
    return { success: false, error: 'Error al obtener perfil', data: null }
  }
}

/**
 * Obtiene insignias del usuario autenticado
 */
export async function getBadgesAction() {
  try {
    const session = await getSession()
    if (!session?.id) {
      return { success: false, error: 'No autenticado', data: [] }
    }

    const badges = await studentRepository.getBadges(session.id)

    return { success: true, data: badges }
  } catch (error) {
    console.error('[getBadgesAction]', error)
    return { success: false, error: 'Error al obtener insignias', data: [] }
  }
}

/**
 * Obtiene logros del usuario autenticado
 */
export async function getAchievementsAction() {
  try {
    const session = await getSession()
    if (!session?.id) {
      return { success: false, error: 'No autenticado', data: [] }
    }

    const achievements = await studentRepository.getAchievements(session.id)

    return { success: true, data: achievements }
  } catch (error) {
    console.error('[getAchievementsAction]', error)
    return { success: false, error: 'Error al obtener logros', data: [] }
  }
}

/**
 * Obtiene misiones activas del usuario autenticado
 */
export async function getActiveMissionsAction() {
  try {
    const session = await getSession()
    if (!session?.id) {
      return { success: false, error: 'No autenticado', data: [] }
    }

    const missions = await studentRepository.getActiveMissions(session.id)

    return { success: true, data: missions }
  } catch (error) {
    console.error('[getActiveMissionsAction]', error)
    return { success: false, error: 'Error al obtener misiones', data: [] }
  }
}

/**
 * Obtiene misiones completadas del usuario autenticado
 */
export async function getCompletedMissionsAction() {
  try {
    const session = await getSession()
    if (!session?.id) {
      return { success: false, error: 'No autenticado', data: [] }
    }

    const missions = await studentRepository.getCompletedMissions(session.id)

    return { success: true, data: missions }
  } catch (error) {
    console.error('[getCompletedMissionsAction]', error)
    return { success: false, error: 'Error al obtener misiones completadas', data: [] }
  }
}

/**
 * Obtiene recompensas disponibles
 */
export async function getAvailableRewardsAction() {
  try {
    const session = await getSession()
    if (!session?.id) {
      return { success: false, error: 'No autenticado', data: [] }
    }

    const rewards = await studentRepository.getAvailableRewards(session.id)

    return { success: true, data: rewards }
  } catch (error) {
    console.error('[getAvailableRewardsAction]', error)
    return { success: false, error: 'Error al obtener recompensas', data: [] }
  }
}

/**
 * Obtiene recompensas reclamadas por el usuario autenticado
 */
export async function getClaimedRewardsAction() {
  try {
    const session = await getSession()
    if (!session?.id) {
      return { success: false, error: 'No autenticado', data: [] }
    }

    const rewards = await studentRepository.getClaimedRewards(session.id)

    return { success: true, data: rewards }
  } catch (error) {
    console.error('[getClaimedRewardsAction]', error)
    return { success: false, error: 'Error al obtener recompensas reclamadas', data: [] }
  }
}

/**
 * Obtiene información de progreso de XP para el siguiente nivel
 */
export async function getXpProgressAction() {
  try {
    const session = await getSession()
    if (!session?.id) {
      return { success: false, error: 'No autenticado', data: null }
    }

    const progress = await studentRepository.getXpForNextLevel(session.id)

    return { success: true, data: progress }
  } catch (error) {
    console.error('[getXpProgressAction]', error)
    return { success: false, error: 'Error al obtener progreso de XP', data: null }
  }
}

/**
 * Obtiene el leaderboard (ranking global)
 */
export async function getLeaderboardAction(limit = 100) {
  try {
    const leaderboard = await studentRepository.getLeaderboard(limit)

    return { success: true, data: leaderboard }
  } catch (error) {
    console.error('[getLeaderboardAction]', error)
    return { success: false, error: 'Error al obtener leaderboard', data: [] }
  }
}
