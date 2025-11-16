'use server'

import { revalidatePath } from 'next/cache'
import { adminRepository } from '@/database/repositories'
import { getSession } from '@/lib/auth'

/**
 * Obtiene todos los badges del sistema
 */
export async function getBadgesAction() {
  try {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
      return { success: false, error: 'No autorizado', data: [] }
    }

    const badges = await adminRepository.getBadges()
    return { success: true, data: badges }
  } catch (error) {
    console.error('[getBadgesAction]', error)
    return { success: false, error: 'Error al obtener badges', data: [] }
  }
}

/**
 * Crea un nuevo badge
 */
export async function createBadgeAction(data: {
  name: string
  description: string
  rarity: string
  points: number
  imageId?: string
}) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
      return { success: false, error: 'No autorizado' }
    }

    const result = await adminRepository.createBadge(data)

    if (result) {
      revalidatePath('/administrador/gamificacion/insignias')
      return { success: true, data: result }
    }

    return { success: false, error: 'Error al crear badge' }
  } catch (error) {
    console.error('[createBadgeAction]', error)
    return { success: false, error: 'Error al crear badge' }
  }
}

/**
 * Actualiza un badge
 */
export async function updateBadgeAction(
  badgeId: string,
  data: {
    name?: string
    description?: string
    rarity?: string
    points?: number
  }
) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
      return { success: false, error: 'No autorizado' }
    }

    const result = await adminRepository.updateBadge(badgeId, data)

    if (result) {
      revalidatePath('/administrador/gamificacion/insignias')
      return { success: true, data: result }
    }

    return { success: false, error: 'Error al actualizar badge' }
  } catch (error) {
    console.error('[updateBadgeAction]', error)
    return { success: false, error: 'Error al actualizar badge' }
  }
}

/**
 * Elimina un badge
 */
export async function deleteBadgeAction(badgeId: string) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
      return { success: false, error: 'No autorizado' }
    }

    const result = await adminRepository.deleteBadge(badgeId)

    if (result?.success) {
      revalidatePath('/administrador/gamificacion/insignias')
      return { success: true }
    }

    return { success: false, error: 'Error al eliminar badge' }
  } catch (error) {
    console.error('[deleteBadgeAction]', error)
    return { success: false, error: 'Error al eliminar badge' }
  }
}

/**
 * Obtiene todos los achievements del sistema
 */
export async function getAchievementsAction() {
  try {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
      return { success: false, error: 'No autorizado', data: [] }
    }

    const achievements = await adminRepository.getAchievements()
    return { success: true, data: achievements }
  } catch (error) {
    console.error('[getAchievementsAction]', error)
    return { success: false, error: 'Error al obtener logros', data: [] }
  }
}

/**
 * Crea un nuevo achievement
 */
export async function createAchievementAction(data: {
  name: string
  description: string
  rewardXp: number
  rewardCoins?: number
  imageId?: string
}) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
      return { success: false, error: 'No autorizado' }
    }

    const result = await adminRepository.createAchievement(data)

    if (result) {
      revalidatePath('/administrador/gamificacion/logros')
      return { success: true, data: result }
    }

    return { success: false, error: 'Error al crear logro' }
  } catch (error) {
    console.error('[createAchievementAction]', error)
    return { success: false, error: 'Error al crear logro' }
  }
}

/**
 * Actualiza un achievement
 */
export async function updateAchievementAction(
  achievementId: string,
  data: {
    name?: string
    description?: string
    rewardXp?: number
    rewardCoins?: number
  }
) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
      return { success: false, error: 'No autorizado' }
    }

    const result = await adminRepository.updateAchievement(achievementId, data)

    if (result) {
      revalidatePath('/administrador/gamificacion/logros')
      return { success: true, data: result }
    }

    return { success: false, error: 'Error al actualizar logro' }
  } catch (error) {
    console.error('[updateAchievementAction]', error)
    return { success: false, error: 'Error al actualizar logro' }
  }
}

/**
 * Elimina un achievement
 */
export async function deleteAchievementAction(achievementId: string) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
      return { success: false, error: 'No autorizado' }
    }

    const result = await adminRepository.deleteAchievement(achievementId)

    if (result?.success) {
      revalidatePath('/administrador/gamificacion/logros')
      return { success: true }
    }

    return { success: false, error: 'Error al eliminar logro' }
  } catch (error) {
    console.error('[deleteAchievementAction]', error)
    return { success: false, error: 'Error al eliminar logro' }
  }
}

/**
 * Obtiene todas las misiones del sistema
 */
export async function getMissionsAction() {
  try {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
      return { success: false, error: 'No autorizado', data: [] }
    }

    const missions = await adminRepository.getMissions()
    return { success: true, data: missions }
  } catch (error) {
    console.error('[getMissionsAction]', error)
    return { success: false, error: 'Error al obtener misiones', data: [] }
  }
}

/**
 * Crea una nueva misión
 */
export async function createMissionAction(data: {
  name: string
  description: string
  difficulty: string
  rewardXp: number
  rewardCoins?: number
  startDate: Date
  endDate: Date
  imageId?: string
  isActive?: boolean
}) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
      return { success: false, error: 'No autorizado' }
    }

    const result = await adminRepository.createMission(data)

    if (result) {
      revalidatePath('/administrador/gamificacion/misiones')
      return { success: true, data: result }
    }

    return { success: false, error: 'Error al crear misión' }
  } catch (error) {
    console.error('[createMissionAction]', error)
    return { success: false, error: 'Error al crear misión' }
  }
}

/**
 * Actualiza una misión
 */
export async function updateMissionAction(
  missionId: string,
  data: {
    name?: string
    description?: string
    difficulty?: string
    rewardXp?: number
    rewardCoins?: number
    isActive?: boolean
  }
) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
      return { success: false, error: 'No autorizado' }
    }

    const result = await adminRepository.updateMission(missionId, data)

    if (result) {
      revalidatePath('/administrador/gamificacion/misiones')
      return { success: true, data: result }
    }

    return { success: false, error: 'Error al actualizar misión' }
  } catch (error) {
    console.error('[updateMissionAction]', error)
    return { success: false, error: 'Error al actualizar misión' }
  }
}

/**
 * Elimina una misión
 */
export async function deleteMissionAction(missionId: string) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
      return { success: false, error: 'No autorizado' }
    }

    const result = await adminRepository.deleteMission(missionId)

    if (result?.success) {
      revalidatePath('/administrador/gamificacion/misiones')
      return { success: true }
    }

    return { success: false, error: 'Error al eliminar misión' }
  } catch (error) {
    console.error('[deleteMissionAction]', error)
    return { success: false, error: 'Error al eliminar misión' }
  }
}

/**
 * Obtiene todas las recompensas del sistema
 */
export async function getRewardsAction() {
  try {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
      return { success: false, error: 'No autorizado', data: [] }
    }

    const rewards = await adminRepository.getRewards()
    return { success: true, data: rewards }
  } catch (error) {
    console.error('[getRewardsAction]', error)
    return { success: false, error: 'Error al obtener recompensas', data: [] }
  }
}

/**
 * Crea una nueva recompensa
 */
export async function createRewardAction(data: {
  name: string
  description: string
  coinCost: number
  category?: string
  stock?: number
  imageId?: string
  isAvailable?: boolean
}) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
      return { success: false, error: 'No autorizado' }
    }

    const result = await adminRepository.createReward(data)

    if (result) {
      revalidatePath('/administrador/gamificacion/tienda')
      return { success: true, data: result }
    }

    return { success: false, error: 'Error al crear recompensa' }
  } catch (error) {
    console.error('[createRewardAction]', error)
    return { success: false, error: 'Error al crear recompensa' }
  }
}

/**
 * Actualiza una recompensa
 */
export async function updateRewardAction(
  rewardId: string,
  data: {
    name?: string
    description?: string
    coinCost?: number
    category?: string
    stock?: number
    isAvailable?: boolean
  }
) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
      return { success: false, error: 'No autorizado' }
    }

    const result = await adminRepository.updateReward(rewardId, data)

    if (result) {
      revalidatePath('/administrador/gamificacion/tienda')
      return { success: true, data: result }
    }

    return { success: false, error: 'Error al actualizar recompensa' }
  } catch (error) {
    console.error('[updateRewardAction]', error)
    return { success: false, error: 'Error al actualizar recompensa' }
  }
}

/**
 * Elimina una recompensa
 */
export async function deleteRewardAction(rewardId: string) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
      return { success: false, error: 'No autorizado' }
    }

    const result = await adminRepository.deleteReward(rewardId)

    if (result?.success) {
      revalidatePath('/administrador/gamificacion/tienda')
      return { success: true }
    }

    return { success: false, error: 'Error al eliminar recompensa' }
  } catch (error) {
    console.error('[deleteRewardAction]', error)
    return { success: false, error: 'Error al eliminar recompensa' }
  }
}

/**
 * Obtiene estadísticas de gamificación
 */
export async function getGamificationStatisticsAction() {
  try {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
      return { success: false, error: 'No autorizado', data: null }
    }

    const stats = await adminRepository.getGamificationStatistics()
    return { success: true, data: stats }
  } catch (error) {
    console.error('[getGamificationStatisticsAction]', error)
    return { success: false, error: 'Error al obtener estadísticas', data: null }
  }
}
