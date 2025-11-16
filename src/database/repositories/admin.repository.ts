/**
 * Admin Repository
 * Centraliza todas las consultas específicas para administradores
 */
import { BaseRepository } from './base.repository'

export class AdminRepository extends BaseRepository {
  /**
   * Obtiene todos los usuarios del sistema
   */
  async getAllUsers(limit = 50, skip = 0) {
    try {
      const [users, total] = await Promise.all([
        this.client.user.findMany({
          include: {
            profile: true,
            instructorProfile: true,
            gamification: true,
            _count: {
              select: {
                enrollments: true,
                reviews: true,
                purchases: true
              }
            }
          },
          take: limit,
          skip,
          orderBy: { createdAt: 'desc' }
        }),
        this.client.user.count()
      ])

      return { users, total }
    } catch (error) {
      this.handleError(error, 'AdminRepository.getAllUsers')
    }
  }

  /**
   * Obtiene todos los cursos del sistema
   */
  async getAllCourses(limit = 50, skip = 0) {
    try {
      const [courses, total] = await Promise.all([
        this.client.course.findMany({
          include: {
            instructor: { include: { user: true } },
            category: true,
            image: true,
            _count: {
              select: {
                enrollments: true,
                reviews: true,
                modules: true
              }
            }
          },
          take: limit,
          skip,
          orderBy: { createdAt: 'desc' }
        }),
        this.client.course.count()
      ])

      return { courses, total }
    } catch (error) {
      this.handleError(error, 'AdminRepository.getAllCourses')
    }
  }

  /**
   * Obtiene categorías del sistema
   */
  async getCategories() {
    try {
      return await this.client.category.findMany({
        include: {
          image: true,
          _count: { select: { courses: true } }
        },
        orderBy: { position: 'asc' }
      })
    } catch (error) {
      this.handleError(error, 'AdminRepository.getCategories')
    }
  }

  /**
   * Obtiene todas las transacciones de pago
   */
  async getPayments(limit = 50, skip = 0) {
    try {
      const [payments, total] = await Promise.all([
        this.client.payment.findMany({
          include: {
            user: { include: { profile: true } },
            paymentMethod: true,
            invoice: true,
            subscription: true
          },
          take: limit,
          skip,
          orderBy: { createdAt: 'desc' }
        }),
        this.client.payment.count()
      ])

      return { payments, total }
    } catch (error) {
      this.handleError(error, 'AdminRepository.getPayments')
    }
  }

  /**
   * Obtiene todas las suscripciones activas
   */
  async getSubscriptions(status?: string) {
    try {
      return await this.client.subscription.findMany({
        where: status ? { status: status as any } : undefined,
        include: {
          user: { include: { profile: true } },
          plan: true,
          paymentMethod: true
        },
        orderBy: { createdAt: 'desc' }
      })
    } catch (error) {
      this.handleError(error, 'AdminRepository.getSubscriptions')
    }
  }

  /**
   * Obtiene los audiologs del sistema
   */
  async getAuditLogs(limit = 100, skip = 0) {
    try {
      const [logs, total] = await Promise.all([
        this.client.auditLog.findMany({
          include: {
            user: { include: { profile: true } }
          },
          take: limit,
          skip,
          orderBy: { createdAt: 'desc' }
        }),
        this.client.auditLog.count()
      ])

      return { logs, total }
    } catch (error) {
      this.handleError(error, 'AdminRepository.getAuditLogs')
    }
  }

  /**
   * Obtiene anuncios/ads del sistema
   */
  async getAnnouncements() {
    try {
      return await this.client.announcement.findMany({
        include: {
          image: true,
          targetCourse: true,
          _count: { select: { userViews: true } }
        },
        orderBy: { createdAt: 'desc' }
      })
    } catch (error) {
      this.handleError(error, 'AdminRepository.getAnnouncements')
    }
  }

  /**
   * Obtiene etiquetas del sistema
   */
  async getTags() {
    try {
      return await this.client.tag.findMany({
        include: {
          _count: { select: { courses: true } }
        },
        orderBy: { name: 'asc' }
      })
    } catch (error) {
      this.handleError(error, 'AdminRepository.getTags')
    }
  }

  /**
   * Obtiene insignias del sistema
   */
  async getBadges() {
    try {
      return await this.client.badge.findMany({
        include: {
          image: true,
          _count: { select: { users: true } }
        },
        orderBy: { createdAt: 'desc' }
      })
    } catch (error) {
      this.handleError(error, 'AdminRepository.getBadges')
    }
  }

  /**
   * Obtiene logros del sistema
   */
  async getAchievements() {
    try {
      return await this.client.achievement.findMany({
        include: {
          image: true,
          _count: { select: { users: true } }
        },
        orderBy: { createdAt: 'desc' }
      })
    } catch (error) {
      this.handleError(error, 'AdminRepository.getAchievements')
    }
  }

  /**
   * Obtiene planes de suscripción
   */
  async getSubscriptionPlans() {
    try {
      return await this.client.subscriptionPlan.findMany({
        include: {
          _count: { select: { subscriptions: true } }
        },
        orderBy: { createdAt: 'desc' }
      })
    } catch (error) {
      this.handleError(error, 'AdminRepository.getSubscriptionPlans')
    }
  }

  /**
   * Obtiene estadísticas generales del sistema
   */
  async getSystemStatistics() {
    try {
      const [totalUsers, totalCourses, totalEnrollments, totalPayments, totalRevenue, activeSubscriptions] = await Promise.all([
        this.client.user.count(),
        this.client.course.count(),
        this.client.enrollment.count(),
        this.client.payment.count(),
        this.client.payment.aggregate({
          where: { status: 'COMPLETED' },
          _sum: { amount: true }
        }),
        this.client.subscription.count({
          where: { status: 'ACTIVE' }
        })
      ])

      const coursesByLevel = await this.client.course.groupBy({
        by: ['level'],
        _count: true
      })

      const usersByRole = await this.client.user.groupBy({
        by: ['role'],
        _count: true
      })

      return {
        totalUsers,
        totalCourses,
        totalEnrollments,
        totalPayments,
        totalRevenue: totalRevenue._sum.amount ?? 0,
        activeSubscriptions,
        coursesByLevel,
        usersByRole
      }
    } catch (error) {
      this.handleError(error, 'AdminRepository.getSystemStatistics')
    }
  }

  /**
   * Obtiene archivos del sistema
   */
  async getFiles(limit = 50, skip = 0) {
    try {
      const [files, total] = await Promise.all([
        this.client.file.findMany({
          include: {
            user: { include: { profile: true } }
          },
          take: limit,
          skip,
          orderBy: { createdAt: 'desc' }
        }),
        this.client.file.count()
      ])

      return { files, total }
    } catch (error) {
      this.handleError(error, 'AdminRepository.getFiles')
    }
  }

  /**
   * Obtiene misiones del sistema
   */
  async getMissions() {
    try {
      return await this.client.mission.findMany({
        include: {
          image: true,
          rewards: { include: { reward: true } },
          _count: { select: { users: true } }
        },
        orderBy: { createdAt: 'desc' }
      })
    } catch (error) {
      this.handleError(error, 'AdminRepository.getMissions')
    }
  }

  /**
   * Obtiene recompensas del sistema
   */
  async getRewards() {
    try {
      return await this.client.reward.findMany({
        include: {
          image: true,
          missionRewards: { include: { mission: true } },
          _count: { select: { users: true } }
        },
        orderBy: { createdAt: 'desc' }
      })
    } catch (error) {
      this.handleError(error, 'AdminRepository.getRewards')
    }
  }

  /**
   * Crea una nueva insignia
   */
  async createBadge(data: { name: string; description: string; rarity: string; points: number; imageId?: string }) {
    try {
      return await this.client.badge.create({
        data: {
          name: data.name,
          description: data.description,
          rarity: data.rarity as any,
          points: data.points,
          imageId: data.imageId
        },
        include: { image: true }
      })
    } catch (error) {
      this.handleError(error, 'AdminRepository.createBadge')
      return null
    }
  }

  /**
   * Actualiza una insignia
   */
  async updateBadge(
    badgeId: string,
    data: {
      name?: string
      description?: string
      rarity?: string
      points?: number
    }
  ) {
    try {
      return await this.client.badge.update({
        where: { id: badgeId },
        data,
        include: { image: true }
      })
    } catch (error) {
      this.handleError(error, 'AdminRepository.updateBadge')
      return null
    }
  }

  /**
   * Elimina una insignia
   */
  async deleteBadge(badgeId: string) {
    try {
      await this.client.badge.delete({
        where: { id: badgeId }
      })
      return { success: true }
    } catch (error) {
      this.handleError(error, 'AdminRepository.deleteBadge')
      return { success: false }
    }
  }

  /**
   * Crea un nuevo logro
   */
  async createAchievement(data: { name: string; description: string; rewardXp: number; rewardCoins?: number; imageId?: string }) {
    try {
      return await this.client.achievement.create({
        data: {
          name: data.name,
          description: data.description,
          rewardXp: data.rewardXp,
          rewardCoins: data.rewardCoins ?? 0,
          imageId: data.imageId
        },
        include: { image: true }
      })
    } catch (error) {
      this.handleError(error, 'AdminRepository.createAchievement')
      return null
    }
  }

  /**
   * Actualiza un logro
   */
  async updateAchievement(
    achievementId: string,
    data: {
      name?: string
      description?: string
      rewardXp?: number
      rewardCoins?: number
    }
  ) {
    try {
      return await this.client.achievement.update({
        where: { id: achievementId },
        data,
        include: { image: true }
      })
    } catch (error) {
      this.handleError(error, 'AdminRepository.updateAchievement')
      return null
    }
  }

  /**
   * Elimina un logro
   */
  async deleteAchievement(achievementId: string) {
    try {
      await this.client.achievement.delete({
        where: { id: achievementId }
      })
      return { success: true }
    } catch (error) {
      this.handleError(error, 'AdminRepository.deleteAchievement')
      return { success: false }
    }
  }

  /**
   * Crea una nueva misión
   */
  async createMission(data: {
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
      return await this.client.mission.create({
        data: {
          name: data.name,
          description: data.description,
          difficulty: data.difficulty as any,
          rewardXp: data.rewardXp,
          rewardCoins: data.rewardCoins ?? 0,
          startDate: data.startDate,
          endDate: data.endDate,
          imageId: data.imageId,
          isActive: data.isActive ?? true
        },
        include: { image: true }
      })
    } catch (error) {
      this.handleError(error, 'AdminRepository.createMission')
      return null
    }
  }

  /**
   * Actualiza una misión
   */
  async updateMission(
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
      return await this.client.mission.update({
        where: { id: missionId },
        data,
        include: { image: true }
      })
    } catch (error) {
      this.handleError(error, 'AdminRepository.updateMission')
      return null
    }
  }

  /**
   * Elimina una misión
   */
  async deleteMission(missionId: string) {
    try {
      await this.client.mission.delete({
        where: { id: missionId }
      })
      return { success: true }
    } catch (error) {
      this.handleError(error, 'AdminRepository.deleteMission')
      return { success: false }
    }
  }

  /**
   * Crea una nueva recompensa
   */
  async createReward(data: {
    name: string
    description: string
    coinCost: number
    category?: string
    stock?: number
    imageId?: string
    isAvailable?: boolean
  }) {
    try {
      return await this.client.reward.create({
        data: {
          name: data.name,
          description: data.description,
          coinCost: data.coinCost,
          category: data.category,
          stock: data.stock,
          imageId: data.imageId,
          isAvailable: data.isAvailable ?? true
        },
        include: { image: true }
      })
    } catch (error) {
      this.handleError(error, 'AdminRepository.createReward')
      return null
    }
  }

  /**
   * Actualiza una recompensa
   */
  async updateReward(
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
      return await this.client.reward.update({
        where: { id: rewardId },
        data,
        include: { image: true }
      })
    } catch (error) {
      this.handleError(error, 'AdminRepository.updateReward')
      return null
    }
  }

  /**
   * Elimina una recompensa
   */
  async deleteReward(rewardId: string) {
    try {
      await this.client.reward.delete({
        where: { id: rewardId }
      })
      return { success: true }
    } catch (error) {
      this.handleError(error, 'AdminRepository.deleteReward')
      return { success: false }
    }
  }

  /**
   * Obtiene estadísticas de gamificación
   */
  async getGamificationStatistics() {
    try {
      const [totalBadges, totalAchievements, totalMissions, totalRewards, xpStats] = await Promise.all([
        this.client.badge.count(),
        this.client.achievement.count(),
        this.client.mission.count(),
        this.client.reward.count(),
        this.client.userGamification.aggregate({
          _avg: { xp: true, level: true, coins: true },
          _max: { xp: true, level: true, coins: true }
        })
      ])

      return {
        totalBadges,
        totalAchievements,
        totalMissions,
        totalRewards,
        xpStatistics: {
          averageXp: xpStats._avg.xp ?? 0,
          averageLevel: xpStats._avg.level ?? 1,
          averageCoins: xpStats._avg.coins ?? 0,
          maxXp: xpStats._max.xp ?? 0,
          maxLevel: xpStats._max.level ?? 1,
          maxCoins: xpStats._max.coins ?? 0
        }
      }
    } catch (error) {
      this.handleError(error, 'AdminRepository.getGamificationStatistics')
      return null
    }
  }
}

export const adminRepository = new AdminRepository()
