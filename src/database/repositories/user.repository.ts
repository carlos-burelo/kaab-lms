/**
 * User Repository
 * Centraliza todas las consultas relacionadas con usuarios
 */
import { BaseRepository } from './base.repository'

export class UserRepository extends BaseRepository {
  /**
   * Obtiene un usuario por ID con información completa
   */
  async getById(userId: string) {
    try {
      return await this.client.user.findUnique({
        where: { id: userId },
        include: {
          profile: true,
          gamification: true,
          preferences: true,
          instructorProfile: true,
          enrollments: { include: { course: true } },
          certificates: { include: { course: true } }
        }
      })
    } catch (error) {
      this.handleError(error, 'UserRepository.getById')
    }
  }

  /**
   * Obtiene un usuario por email
   */
  async getByEmail(email: string) {
    try {
      return await this.client.user.findUnique({
        where: { email },
        include: {
          profile: true,
          gamification: true,
          preferences: true,
          instructorProfile: true
        }
      })
    } catch (error) {
      this.handleError(error, 'UserRepository.getByEmail')
    }
  }

  /**
   * Obtiene el perfil de un usuario
   */
  async getProfile(userId: string) {
    try {
      return await this.client.userProfile.findUnique({
        where: { userId }
      })
    } catch (error) {
      this.handleError(error, 'UserRepository.getProfile')
    }
  }

  /**
   * Actualiza el perfil de un usuario
   */
  async updateProfile(userId: string, data: any) {
    try {
      return await this.client.userProfile.upsert({
        where: { userId },
        create: {
          userId,
          ...data
        },
        update: data
      })
    } catch (error) {
      this.handleError(error, 'UserRepository.updateProfile')
    }
  }

  /**
   * Obtiene preferencias del usuario
   */
  async getPreferences(userId: string) {
    try {
      return await this.client.userPreferences.findUnique({
        where: { userId }
      })
    } catch (error) {
      this.handleError(error, 'UserRepository.getPreferences')
    }
  }

  /**
   * Actualiza preferencias del usuario
   */
  async updatePreferences(userId: string, preferences: any) {
    try {
      return await this.client.userPreferences.upsert({
        where: { userId },
        create: {
          userId,
          preferences
        },
        update: { preferences }
      })
    } catch (error) {
      this.handleError(error, 'UserRepository.updatePreferences')
    }
  }

  /**
   * Obtiene notificaciones del usuario
   */
  async getNotifications(userId: string, limit = 20, skip = 0) {
    try {
      return await this.client.notification.findMany({
        where: { userId },
        take: limit,
        skip,
        orderBy: { createdAt: 'desc' }
      })
    } catch (error) {
      this.handleError(error, 'UserRepository.getNotifications')
    }
  }

  /**
   * Marca una notificación como leída
   */
  async markNotificationAsRead(notificationId: string) {
    try {
      return await this.client.notification.update({
        where: { id: notificationId },
        data: { isRead: true, readAt: new Date() }
      })
    } catch (error) {
      this.handleError(error, 'UserRepository.markNotificationAsRead')
    }
  }

  /**
   * Obtiene conversaciones del usuario
   */
  async getConversations(userId: string) {
    try {
      return await this.client.conversation.findMany({
        where: {
          OR: [{ initiatorId: userId }, { receiverId: userId }]
        },
        include: {
          initiator: { include: { profile: true } },
          receiver: { include: { profile: true } },
          messages: {
            take: 1,
            orderBy: { createdAt: 'desc' }
          }
        },
        orderBy: { lastMessageAt: 'desc' }
      })
    } catch (error) {
      this.handleError(error, 'UserRepository.getConversations')
    }
  }

  /**
   * Obtiene mensajes de una conversación
   */
  async getMessages(conversationId: string, limit = 50, skip = 0) {
    try {
      return await this.client.message.findMany({
        where: { conversationId },
        include: {
          sender: { include: { profile: true } },
          file: true
        },
        take: limit,
        skip,
        orderBy: { createdAt: 'asc' }
      })
    } catch (error) {
      this.handleError(error, 'UserRepository.getMessages')
    }
  }

  /**
   * Obtiene historial de pagos del usuario
   */
  async getPaymentHistory(userId: string, limit = 20, skip = 0) {
    try {
      return await this.client.payment.findMany({
        where: { userId },
        include: {
          paymentMethod: true,
          invoice: true,
          subscription: true
        },
        take: limit,
        skip,
        orderBy: { createdAt: 'desc' }
      })
    } catch (error) {
      this.handleError(error, 'UserRepository.getPaymentHistory')
    }
  }

  /**
   * Obtiene suscripciones del usuario
   */
  async getSubscriptions(userId: string) {
    try {
      return await this.client.subscription.findMany({
        where: { userId },
        include: {
          plan: true,
          paymentMethod: true,
          payments: true
        },
        orderBy: { createdAt: 'desc' }
      })
    } catch (error) {
      this.handleError(error, 'UserRepository.getSubscriptions')
    }
  }

  /**
   * Obtiene métodos de pago del usuario
   */
  async getPaymentMethods(userId: string) {
    try {
      return await this.client.paymentMethod.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      })
    } catch (error) {
      this.handleError(error, 'UserRepository.getPaymentMethods')
    }
  }

  /**
   * Obtiene facturas del usuario
   */
  async getInvoices(userId: string, limit = 20, skip = 0) {
    try {
      return await this.client.invoice.findMany({
        where: { userId },
        include: {
          items: true,
          file: true,
          payment: true
        },
        take: limit,
        skip,
        orderBy: { createdAt: 'desc' }
      })
    } catch (error) {
      this.handleError(error, 'UserRepository.getInvoices')
    }
  }

  /**
   * Crea un usuario
   */
  async create(data: any) {
    try {
      const user = await this.client.user.create({
        data,
        include: {
          profile: true,
          gamification: true,
          preferences: true
        }
      })

      // Crear perfil de gamificación asociado
      await this.client.userGamification.create({
        data: { userId: user.id }
      })

      // Crear preferencias por defecto
      await this.client.userPreferences.create({
        data: { userId: user.id }
      })

      return user
    } catch (error) {
      this.handleError(error, 'UserRepository.create')
    }
  }

  /**
   * Actualiza un usuario
   */
  async update(userId: string, data: any) {
    try {
      return await this.client.user.update({
        where: { id: userId },
        data,
        include: {
          profile: true,
          gamification: true,
          preferences: true
        }
      })
    } catch (error) {
      this.handleError(error, 'UserRepository.update')
    }
  }

  /**
   * Desactiva una cuenta de usuario
   */
  async deactivate(userId: string) {
    try {
      return await this.client.user.update({
        where: { id: userId },
        data: { isActive: false }
      })
    } catch (error) {
      this.handleError(error, 'UserRepository.deactivate')
    }
  }

  /**
   * Activa una cuenta de usuario
   */
  async activate(userId: string) {
    try {
      return await this.client.user.update({
        where: { id: userId },
        data: { isActive: true }
      })
    } catch (error) {
      this.handleError(error, 'UserRepository.activate')
    }
  }

  /**
   * Verifica el email del usuario
   */
  async verifyEmail(userId: string) {
    try {
      return await this.client.user.update({
        where: { id: userId },
        data: { emailVerified: new Date() }
      })
    } catch (error) {
      this.handleError(error, 'UserRepository.verifyEmail')
    }
  }

  /**
   * Obtiene usuarios por rol
   */
  async getByRole(role: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN', limit = 50, skip = 0) {
    try {
      return await this.client.user.findMany({
        where: { role },
        include: {
          profile: true,
          instructorProfile: true,
          _count: {
            select: {
              enrollments: true,
              reviews: true
            }
          }
        },
        take: limit,
        skip,
        orderBy: { createdAt: 'desc' }
      })
    } catch (error) {
      this.handleError(error, 'UserRepository.getByRole')
    }
  }

  /**
   * Busca usuarios por nombre o email
   */
  async search(term: string, limit = 20, skip = 0) {
    try {
      return await this.client.user.findMany({
        where: {
          OR: [{ email: { contains: term } }, { profile: { name: { contains: term } } }]
        },
        include: {
          profile: true,
          instructorProfile: true
        },
        take: limit,
        skip,
        orderBy: { createdAt: 'desc' }
      })
    } catch (error) {
      this.handleError(error, 'UserRepository.search')
    }
  }

  /**
   * Crea una notificación para un usuario
   */
  async createNotification(data: {
    userId: string
    type: any
    title: string
    message: string
    resourceId?: string
    resourceType?: string
    data?: Record<string, any>
  }) {
    try {
      return await this.client.notification.create({
        data: {
          userId: data.userId,
          type: data.type,
          title: data.title,
          message: data.message,
          resourceId: data.resourceId,
          resourceType: data.resourceType,
          data: data.data,
          isRead: false
        }
      })
    } catch (error) {
      this.handleError(error, 'UserRepository.createNotification')
    }
  }

  /**
   * Obtiene notificaciones de un usuario
   */
  async getNotifications(userId: string, limit = 20) {
    try {
      return await this.client.notification.findMany({
        where: { userId },
        take: limit,
        orderBy: { createdAt: 'desc' }
      })
    } catch (error) {
      this.handleError(error, 'UserRepository.getNotifications')
      return []
    }
  }

  /**
   * Obtiene notificaciones no leídas
   */
  async getUnreadNotifications(userId: string) {
    try {
      return await this.client.notification.findMany({
        where: { userId, isRead: false },
        orderBy: { createdAt: 'desc' }
      })
    } catch (error) {
      this.handleError(error, 'UserRepository.getUnreadNotifications')
      return []
    }
  }

  /**
   * Cuenta notificaciones no leídas
   */
  async getUnreadNotificationCount(userId: string) {
    try {
      return await this.client.notification.count({
        where: { userId, isRead: false }
      })
    } catch (error) {
      this.handleError(error, 'UserRepository.getUnreadNotificationCount')
      return 0
    }
  }

  /**
   * Obtiene una notificación por ID
   */
  async getNotificationById(notificationId: string) {
    try {
      return await this.client.notification.findUnique({
        where: { id: notificationId }
      })
    } catch (error) {
      this.handleError(error, 'UserRepository.getNotificationById')
      return null
    }
  }

  /**
   * Marca una notificación como leída
   */
  async markNotificationAsRead(notificationId: string) {
    try {
      return await this.client.notification.update({
        where: { id: notificationId },
        data: { isRead: true }
      })
    } catch (error) {
      this.handleError(error, 'UserRepository.markNotificationAsRead')
    }
  }

  /**
   * Marca todas las notificaciones como leídas
   */
  async markAllNotificationsAsRead(userId: string) {
    try {
      return await this.client.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true }
      })
    } catch (error) {
      this.handleError(error, 'UserRepository.markAllNotificationsAsRead')
    }
  }

  /**
   * Elimina una notificación
   */
  async deleteNotification(notificationId: string) {
    try {
      return await this.client.notification.delete({
        where: { id: notificationId }
      })
    } catch (error) {
      this.handleError(error, 'UserRepository.deleteNotification')
    }
  }

  /**
   * Obtiene un usuario por ID
   */
  async getUserById(userId: string) {
    try {
      return await this.client.user.findUnique({
        where: { id: userId },
        include: { profile: true }
      })
    } catch (error) {
      this.handleError(error, 'UserRepository.getUserById')
      return null
    }
  }

  /**
   * Crea un mensaje
   */
  async createMessage(data: {
    senderId: string
    recipientId: string
    content: string
    fileIds?: string[]
  }) {
    try {
      const message = await this.client.message.create({
        data: {
          senderId: data.senderId,
          recipientId: data.recipientId,
          content: data.content,
          createdAt: new Date()
        }
      })

      // Conectar archivos si existen
      if (data.fileIds && data.fileIds.length > 0) {
        await this.client.message.update({
          where: { id: message.id },
          data: {
            files: {
              connect: data.fileIds.map((id) => ({ id }))
            }
          }
        })
      }

      return message
    } catch (error) {
      this.handleError(error, 'UserRepository.createMessage')
    }
  }

  /**
   * Obtiene conversaciones de un usuario
   */
  async getConversations(userId: string, limit = 50, skip = 0) {
    try {
      return await this.client.conversation.findMany({
        where: {
          OR: [{ userId }, { recipientId: userId }]
        },
        include: {
          user: { include: { profile: true } },
          recipient: { include: { profile: true } },
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        },
        orderBy: { updatedAt: 'desc' },
        take: limit,
        skip
      })
    } catch (error) {
      this.handleError(error, 'UserRepository.getConversations')
      return []
    }
  }

  /**
   * Obtiene una conversación por ID
   */
  async getConversationById(conversationId: string) {
    try {
      return await this.client.conversation.findUnique({
        where: { id: conversationId },
        include: {
          user: { include: { profile: true } },
          recipient: { include: { profile: true } }
        }
      })
    } catch (error) {
      this.handleError(error, 'UserRepository.getConversationById')
      return null
    }
  }

  /**
   * Obtiene mensajes de una conversación
   */
  async getConversationMessages(conversationId: string, limit = 50, skip = 0) {
    try {
      return await this.client.message.findMany({
        where: { conversationId },
        include: {
          sender: { include: { profile: true } },
          files: true
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip
      })
    } catch (error) {
      this.handleError(error, 'UserRepository.getConversationMessages')
      return []
    }
  }

  /**
   * Marca mensajes como leídos
   */
  async markConversationMessagesAsRead(conversationId: string, userId: string) {
    try {
      return await this.client.message.updateMany({
        where: {
          conversationId,
          recipientId: userId,
          isRead: false
        },
        data: { isRead: true }
      })
    } catch (error) {
      this.handleError(error, 'UserRepository.markConversationMessagesAsRead')
    }
  }

  /**
   * Busca una conversación entre dos usuarios
   */
  async findConversation(userId1: string, userId2: string) {
    try {
      return await this.client.conversation.findFirst({
        where: {
          OR: [
            { userId: userId1, recipientId: userId2 },
            { userId: userId2, recipientId: userId1 }
          ]
        }
      })
    } catch (error) {
      this.handleError(error, 'UserRepository.findConversation')
      return null
    }
  }

  /**
   * Crea una conversación
   */
  async createConversation(userId1: string, userId2: string) {
    try {
      return await this.client.conversation.create({
        data: {
          userId: userId1,
          recipientId: userId2
        }
      })
    } catch (error) {
      this.handleError(error, 'UserRepository.createConversation')
    }
  }

  /**
   * Elimina una conversación
   */
  async deleteConversation(conversationId: string) {
    try {
      return await this.client.conversation.delete({
        where: { id: conversationId }
      })
    } catch (error) {
      this.handleError(error, 'UserRepository.deleteConversation')
    }
  }

  /**
   * Busca usuarios
   */
  async searchUsers(query: string, limit = 10) {
    try {
      return await this.client.user.findMany({
        where: {
          OR: [
            { email: { contains: query } },
            { profile: { name: { contains: query } } }
          ]
        },
        include: { profile: true },
        take: limit
      })
    } catch (error) {
      this.handleError(error, 'UserRepository.searchUsers')
      return []
    }
  }

  /**
   * Crea un progreso de ruta de aprendizaje
   */
  async createLearningPathProgress(data: {
    userId: string
    learningPathId: string
    currentNodeId: string | null
    completedNodes: string[]
    status: string
  }) {
    try {
      return await this.client.learningPathProgress.create({
        data: {
          userId: data.userId,
          learningPathId: data.learningPathId,
          currentNodeId: data.currentNodeId,
          completedNodes: data.completedNodes,
          status: data.status,
          startedAt: new Date()
        },
        include: {
          learningPath: true
        }
      })
    } catch (error) {
      this.handleError(error, 'UserRepository.createLearningPathProgress')
    }
  }

  /**
   * Obtiene el progreso de una ruta de aprendizaje
   */
  async getLearningPathProgress(learningPathId: string, userId: string) {
    try {
      return await this.client.learningPathProgress.findFirst({
        where: {
          learningPathId,
          userId
        },
        include: {
          learningPath: {
            include: {
              nodes: true,
              edges: true
            }
          }
        }
      })
    } catch (error) {
      this.handleError(error, 'UserRepository.getLearningPathProgress')
      return null
    }
  }

  /**
   * Actualiza el progreso de una ruta de aprendizaje
   */
  async updateLearningPathProgress(
    learningPathId: string,
    userId: string,
    data: {
      currentNodeId?: string | null
      completedNodes?: string[]
      lastCompletedAt?: Date
      completionData?: Record<string, any>
      status?: string
    }
  ) {
    try {
      return await this.client.learningPathProgress.updateMany({
        where: {
          learningPathId,
          userId
        },
        data: {
          ...(data.currentNodeId !== undefined && { currentNodeId: data.currentNodeId }),
          ...(data.completedNodes && { completedNodes: data.completedNodes }),
          ...(data.lastCompletedAt && { lastCompletedAt: data.lastCompletedAt }),
          ...(data.completionData && { completionData: data.completionData }),
          ...(data.status && { status: data.status })
        }
      })
    } catch (error) {
      this.handleError(error, 'UserRepository.updateLearningPathProgress')
    }
  }

  /**
   * Obtiene las rutas de aprendizaje disponibles para un estudiante
   */
  async getAvailableLearningPaths(userId: string) {
    try {
      return await this.client.learningPath.findMany({
        where: {
          isPublished: true
        },
        include: {
          instructor: { include: { profile: true } },
          nodes: true,
          edges: true,
          _count: {
            select: {
              progress: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    } catch (error) {
      this.handleError(error, 'UserRepository.getAvailableLearningPaths')
      return []
    }
  }

  /**
   * Obtiene las rutas de aprendizaje en progreso de un estudiante
   */
  async getStudentLearningPathsInProgress(userId: string) {
    try {
      return await this.client.learningPathProgress.findMany({
        where: {
          userId,
          status: 'IN_PROGRESS'
        },
        include: {
          learningPath: {
            include: {
              instructor: { include: { profile: true } },
              nodes: true,
              edges: true
            }
          }
        },
        orderBy: { startedAt: 'desc' }
      })
    } catch (error) {
      this.handleError(error, 'UserRepository.getStudentLearningPathsInProgress')
      return []
    }
  }
}

export const userRepository = new UserRepository()
