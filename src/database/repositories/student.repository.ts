/**
 * Student Repository
 * Centraliza todas las consultas específicas para estudiantes
 */
import { BaseRepository } from './base.repository'

export class StudentRepository extends BaseRepository {
  /**
   * Obtiene los cursos en los que está inscrito un estudiante
   */
  async getEnrolledCourses(userId: string) {
    try {
      return await this.client.enrollment.findMany({
        where: { userId },
        include: {
          course: {
            include: {
              instructor: {
                include: { user: true }
              },
              category: true,
              image: true,
              tags: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    } catch (error) {
      this.handleError(error, 'StudentRepository.getEnrolledCourses')
    }
  }

  /**
   * Obtiene el progreso de un estudiante en un curso específico
   */
  async getCourseProgress(userId: string, courseId: string) {
    try {
      const enrollment = await this.client.enrollment.findUnique({
        where: {
          userId_courseId: { userId, courseId }
        },
        include: {
          course: {
            include: { modules: true }
          }
        }
      })

      const lessonProgress = await this.client.userLessonProgress.findMany({
        where: { userId }
      })

      return { enrollment, lessonProgress }
    } catch (error) {
      this.handleError(error, 'StudentRepository.getCourseProgress')
    }
  }

  /**
   * Obtiene lecciones completadas por un estudiante
   */
  async getCompletedLessons(userId: string) {
    try {
      return await this.client.userLessonProgress.findMany({
        where: {
          userId,
          isCompleted: true
        },
        include: {
          lesson: {
            include: {
              module: {
                include: { course: true }
              }
            }
          }
        }
      })
    } catch (error) {
      this.handleError(error, 'StudentRepository.getCompletedLessons')
    }
  }

  /**
   * Obtiene el perfil de gamificación del estudiante
   */
  async getGamificationProfile(userId: string) {
    try {
      return await this.client.userGamification.findUnique({
        where: { userId }
      })
    } catch (error) {
      this.handleError(error, 'StudentRepository.getGamificationProfile')
    }
  }

  /**
   * Obtiene los cuestionarios intentados por el estudiante
   */
  async getQuizAttempts(userId: string) {
    try {
      return await this.client.userQuizAttempt.findMany({
        where: { userId },
        include: {
          quiz: {
            include: {
              lesson: {
                include: {
                  module: {
                    include: { course: true }
                  }
                }
              }
            }
          }
        },
        orderBy: { startedAt: 'desc' }
      })
    } catch (error) {
      this.handleError(error, 'StudentRepository.getQuizAttempts')
    }
  }

  /**
   * Obtiene los certificados ganados por el estudiante
   */
  async getCertificates(userId: string) {
    try {
      return await this.client.certificate.findMany({
        where: { userId },
        include: {
          course: true,
          template: true,
          file: true
        },
        orderBy: { issuedAt: 'desc' }
      })
    } catch (error) {
      this.handleError(error, 'StudentRepository.getCertificates')
    }
  }

  /**
   * Obtiene tareas personales del estudiante
   */
  async getPersonalTasks(userId: string) {
    try {
      return await this.client.personalTask.findMany({
        where: { userId },
        orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }]
      })
    } catch (error) {
      this.handleError(error, 'StudentRepository.getPersonalTasks')
    }
  }

  /**
   * Obtiene eventos del calendario del estudiante
   */
  async getCalendarEvents(userId: string, startDate: Date, endDate: Date) {
    try {
      return await this.client.calendarEvent.findMany({
        where: {
          userId,
          startDate: { gte: startDate },
          endDate: { lte: endDate }
        },
        orderBy: { startDate: 'asc' }
      })
    } catch (error) {
      this.handleError(error, 'StudentRepository.getCalendarEvents')
    }
  }

  /**
   * Obtiene logros del estudiante
   */
  async getAchievements(userId: string) {
    try {
      return await this.client.userAchievement.findMany({
        where: { userId },
        include: {
          achievement: {
            include: { image: true }
          }
        }
      })
    } catch (error) {
      this.handleError(error, 'StudentRepository.getAchievements')
    }
  }

  /**
   * Obtiene insignias del estudiante
   */
  async getBadges(userId: string) {
    try {
      return await this.client.userBadge.findMany({
        where: { userId },
        include: {
          badge: {
            include: { image: true }
          }
        }
      })
    } catch (error) {
      this.handleError(error, 'StudentRepository.getBadges')
    }
  }

  /**
   * Obtiene cursos disponibles (públicos y no inscritos)
   */
  async getAvailableCourses(userId: string, limit = 20, skip = 0) {
    try {
      return await this.client.course.findMany({
        where: {
          isPublished: true,
          enrollments: {
            none: { userId }
          }
        },
        include: {
          instructor: { include: { user: true } },
          category: true,
          image: true,
          _count: {
            select: { enrollments: true, reviews: true }
          }
        },
        take: limit,
        skip,
        orderBy: { createdAt: 'desc' }
      })
    } catch (error) {
      this.handleError(error, 'StudentRepository.getAvailableCourses')
    }
  }

  /**
   * Agrega XP a un estudiante y retorna nuevo nivel
   */
  async addXp(userId: string, points: number, sourceType: string, sourceId: string) {
    try {
      // Crear registro de XP
      await this.client.userXpRecord.create({
        data: {
          userId,
          points,
          sourceType: sourceType as any,
          sourceId,
          description: `Ganaste ${points} XP por ${sourceType.toLowerCase()}`
        }
      })

      // Actualizar XP total
      const gamification = await this.client.userGamification.update({
        where: { userId },
        data: { xp: { increment: points } }
      })

      // Calcular nuevo nivel
      const newLevel = this.calculateLevelFromXp(gamification.xp)

      // Actualizar nivel si cambió
      if (newLevel !== gamification.level) {
        await this.client.userGamification.update({
          where: { userId },
          data: { level: newLevel }
        })
      }

      return { xp: gamification.xp + points, level: newLevel }
    } catch (error) {
      this.handleError(error, 'StudentRepository.addXp')
      return null
    }
  }

  /**
   * Agrega coins (moneda virtual) a un estudiante
   */
  async addCoins(userId: string, amount: number) {
    try {
      const gamification = await this.client.userGamification.update({
        where: { userId },
        data: { coins: { increment: amount } }
      })
      return gamification.coins
    } catch (error) {
      this.handleError(error, 'StudentRepository.addCoins')
      return null
    }
  }

  /**
   * Otorga una insignia a un estudiante
   */
  async awardBadge(userId: string, badgeId: string) {
    try {
      // Verificar si ya tiene la insignia
      const existing = await this.client.userBadge.findUnique({
        where: { userId_badgeId: { userId, badgeId } }
      })

      if (existing) {
        return { success: false, message: 'Ya tienes esta insignia' }
      }

      // Obtener información de la insignia
      const badge = await this.client.badge.findUnique({
        where: { id: badgeId },
        select: { points: true, name: true }
      })

      // Crear UserBadge
      await this.client.userBadge.create({
        data: {
          userId,
          badgeId,
          progress: 100,
          obtainedAt: new Date()
        }
      })

      // Sumar XP de la insignia
      if (badge?.points) {
        await this.addXp(userId, badge.points, 'BADGE_EARNED', badgeId)
      }

      return { success: true, message: `¡Insignia "${badge?.name}" obtenida!` }
    } catch (error) {
      this.handleError(error, 'StudentRepository.awardBadge')
      return { success: false, message: 'Error al otorgar insignia' }
    }
  }

  /**
   * Marca un logro como completado
   */
  async completeAchievement(userId: string, achievementId: string) {
    try {
      const achievement = await this.client.achievement.findUnique({
        where: { id: achievementId },
        select: { name: true, rewardXp: true, rewardCoins: true }
      })

      const _userAchievement = await this.client.userAchievement.update({
        where: { userId_achievementId: { userId, achievementId } },
        data: {
          completed: true,
          obtainedAt: new Date(),
          progress: 100
        }
      })

      // Agregar recompensas
      if (achievement?.rewardXp) {
        await this.addXp(userId, achievement.rewardXp, 'ACHIEVEMENT_COMPLETED', achievementId)
      }
      if (achievement?.rewardCoins) {
        await this.addCoins(userId, achievement.rewardCoins)
      }

      return { success: true, message: `¡Logro "${achievement?.name}" completado!` }
    } catch (error) {
      this.handleError(error, 'StudentRepository.completeAchievement')
      return { success: false, message: 'Error al completar logro' }
    }
  }

  /**
   * Obtiene misiones activas para un estudiante
   */
  async getActiveMissions(userId: string) {
    try {
      const now = new Date()
      return await this.client.mission.findMany({
        where: {
          isActive: true,
          startDate: { lte: now },
          endDate: { gte: now }
        },
        include: {
          users: {
            where: { userId },
            select: { id: true, progress: true, completed: true }
          },
          rewards: {
            include: { reward: true }
          },
          image: true
        }
      })
    } catch (error) {
      this.handleError(error, 'StudentRepository.getActiveMissions')
      return []
    }
  }

  /**
   * Acepta una misión
   */
  async acceptMission(userId: string, missionId: string) {
    try {
      const existing = await this.client.userMission.findFirst({
        where: { userId, missionId }
      })

      if (existing) {
        return { success: false, message: 'Ya has aceptado esta misión' }
      }

      await this.client.userMission.create({
        data: {
          userId,
          missionId,
          progress: {},
          startedAt: new Date()
        }
      })

      return { success: true, message: 'Misión aceptada' }
    } catch (error) {
      this.handleError(error, 'StudentRepository.acceptMission')
      return { success: false, message: 'Error al aceptar misión' }
    }
  }

  /**
   * Completa una misión
   */
  async completeMission(userId: string, missionId: string) {
    try {
      const mission = await this.client.mission.findUnique({
        where: { id: missionId },
        select: { name: true, rewardXp: true, rewardCoins: true }
      })

      const _userMission = await this.client.userMission.update({
        where: {
          userId_missionId_startedAt: {
            userId,
            missionId,
            startedAt: new Date() // Esto podría necesitar ajustarse
          }
        },
        data: {
          completed: true,
          completedAt: new Date()
        }
      })

      // Agregar recompensas
      if (mission?.rewardXp) {
        await this.addXp(userId, mission.rewardXp, 'MISSION_COMPLETED', missionId)
      }
      if (mission?.rewardCoins) {
        await this.addCoins(userId, mission.rewardCoins)
      }

      return { success: true, message: `¡Misión "${mission?.name}" completada!` }
    } catch (error) {
      this.handleError(error, 'StudentRepository.completeMission')
      return { success: false, message: 'Error al completar misión' }
    }
  }

  /**
   * Obtiene recompensas disponibles en la tienda
   */
  async getAvailableRewards(userId: string) {
    try {
      const gamification = await this.client.userGamification.findUnique({
        where: { userId },
        select: { coins: true }
      })

      const rewards = await this.client.reward.findMany({
        where: { isAvailable: true },
        include: { image: true },
        orderBy: { createdAt: 'desc' }
      })

      return rewards.map((reward) => ({
        ...reward,
        canAfford: gamification ? reward.coinCost <= gamification.coins : false
      }))
    } catch (error) {
      this.handleError(error, 'StudentRepository.getAvailableRewards')
      return []
    }
  }

  /**
   * Reclamar una recompensa
   */
  async claimReward(userId: string, rewardId: string) {
    try {
      const gamification = await this.client.userGamification.findUnique({
        where: { userId },
        select: { coins: true }
      })

      const reward = await this.client.reward.findUnique({
        where: { id: rewardId },
        select: { name: true, coinCost: true, stock: true }
      })

      if (!gamification || !reward) {
        return { success: false, message: 'Recompensa no encontrada' }
      }

      if (gamification.coins < reward.coinCost) {
        return { success: false, message: 'No tienes suficientes coins' }
      }

      if (reward.stock !== null && reward.stock <= 0) {
        return { success: false, message: 'Recompensa agotada' }
      }

      // Deducir coins
      await this.client.userGamification.update({
        where: { userId },
        data: { coins: { decrement: reward.coinCost } }
      })

      // Crear UserReward
      await this.client.userReward.create({
        data: {
          userId,
          rewardId,
          quantity: 1,
          obtainedAt: new Date()
        }
      })

      // Reducir stock
      if (reward.stock !== null) {
        await this.client.reward.update({
          where: { id: rewardId },
          data: { stock: { decrement: 1 } }
        })
      }

      return { success: true, message: `¡Has obtenido "${reward.name}"!` }
    } catch (error) {
      this.handleError(error, 'StudentRepository.claimReward')
      return { success: false, message: 'Error al reclamar recompensa' }
    }
  }

  /**
   * Obtiene el leaderboard (ranking de estudiantes)
   */
  async getLeaderboard(limit = 100) {
    try {
      return await this.client.userGamification.findMany({
        include: {
          user: {
            include: { profile: true }
          }
        },
        orderBy: [{ xp: 'desc' }, { level: 'desc' }],
        take: limit
      })
    } catch (error) {
      this.handleError(error, 'StudentRepository.getLeaderboard')
      return []
    }
  }

  /**
   * Calcula el nivel basado en XP
   * Formula: Level = sqrt(XP / 100) + 1
   */
  private calculateLevelFromXp(xp: number): number {
    return Math.floor(Math.sqrt(xp / 100)) + 1
  }

  /**
   * Obtiene el XP necesario para el siguiente nivel
   */
  async getXpForNextLevel(userId: string) {
    try {
      const gamification = await this.client.userGamification.findUnique({
        where: { userId },
        select: { xp: true, level: true }
      })

      if (!gamification) return null

      const xpForNextLevel = gamification.level ** 2 * 100
      const xpProgress = gamification.xp
      const remaining = Math.max(0, xpForNextLevel - xpProgress)

      return {
        current: xpProgress,
        required: xpForNextLevel,
        remaining,
        progress: (xpProgress / xpForNextLevel) * 100
      }
    } catch (error) {
      this.handleError(error, 'StudentRepository.getXpForNextLevel')
      return null
    }
  }

  /**
   * Obtiene misiones completadas por un estudiante
   */
  async getCompletedMissions(userId: string) {
    try {
      return await this.client.userMission.findMany({
        where: {
          userId,
          completed: true
        },
        include: {
          mission: {
            include: { image: true }
          }
        },
        orderBy: { completedAt: 'desc' }
      })
    } catch (error) {
      this.handleError(error, 'StudentRepository.getCompletedMissions')
      return []
    }
  }

  /**
   * Obtiene recompensas reclamadas por un estudiante
   */
  async getClaimedRewards(userId: string) {
    try {
      return await this.client.userReward.findMany({
        where: { userId },
        include: {
          reward: {
            include: { image: true }
          }
        },
        orderBy: { obtainedAt: 'desc' }
      })
    } catch (error) {
      this.handleError(error, 'StudentRepository.getClaimedRewards')
      return []
    }
  }

  /**
   * Obtiene inscripción de estudiante en curso (para validación)
   */
  async getEnrollmentByCourseId(courseId: string, userId: string) {
    try {
      return await this.client.enrollment.findUnique({
        where: {
          userId_courseId: { userId, courseId }
        }
      })
    } catch (error) {
      this.handleError(error, 'StudentRepository.getEnrollmentByCourseId')
    }
  }

  /**
   * Envía una asignación
   */
  async submitAssignment(data: {
    assignmentId: string
    userId: string
    submissionText: string | null
    fileIds: string[]
  }) {
    try {
      const submission = await this.client.assignmentSubmission.create({
        data: {
          assignmentId: data.assignmentId,
          userId: data.userId,
          submissionText: data.submissionText,
          submittedAt: new Date(),
          status: 'SUBMITTED'
        }
      })

      // Conectar archivos si existen
      if (data.fileIds.length > 0) {
        await this.client.assignmentSubmission.update({
          where: { id: submission.id },
          data: {
            files: {
              connect: data.fileIds.map((id) => ({ id }))
            }
          }
        })
      }

      return submission
    } catch (error) {
      this.handleError(error, 'StudentRepository.submitAssignment')
    }
  }

  /**
   * Obtiene entregas de asignaciones del estudiante en un curso
   */
  async getStudentAssignmentSubmissions(userId: string, courseId: string) {
    try {
      return await this.client.assignmentSubmission.findMany({
        where: {
          userId,
          assignment: {
            lesson: {
              module: {
                courseId
              }
            }
          }
        },
        include: {
          assignment: {
            include: {
              lesson: true
            }
          },
          files: true
        },
        orderBy: { submittedAt: 'desc' }
      })
    } catch (error) {
      this.handleError(error, 'StudentRepository.getStudentAssignmentSubmissions')
      return []
    }
  }
}

export const studentRepository = new StudentRepository()
