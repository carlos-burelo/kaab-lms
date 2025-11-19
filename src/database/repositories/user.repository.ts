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
    } catch (_error) {
      this.handleError(_error, 'UserRepository.getById')
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
    } catch (_error) {
      this.handleError(_error, 'UserRepository.getByEmail')
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
    } catch (_error) {
      this.handleError(_error, 'UserRepository.getProfile')
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
    } catch (_error) {
      this.handleError(_error, 'UserRepository.updateProfile')
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
    } catch (_error) {
      this.handleError(_error, 'UserRepository.getPreferences')
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
    } catch (_error) {
      this.handleError(_error, 'UserRepository.updatePreferences')
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
    } catch (_error) {
      this.handleError(_error, 'UserRepository.getMessages')
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
    } catch (_error) {
      this.handleError(_error, 'UserRepository.getPaymentHistory')
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
    } catch (_error) {
      this.handleError(_error, 'UserRepository.getSubscriptions')
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
    } catch (_error) {
      this.handleError(_error, 'UserRepository.getPaymentMethods')
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
    } catch (_error) {
      this.handleError(_error, 'UserRepository.getInvoices')
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
    } catch (_error) {
      this.handleError(_error, 'UserRepository.create')
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
    } catch (_error) {
      this.handleError(_error, 'UserRepository.update')
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
    } catch (_error) {
      this.handleError(_error, 'UserRepository.deactivate')
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
    } catch (_error) {
      this.handleError(_error, 'UserRepository.activate')
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
    } catch (_error) {
      this.handleError(_error, 'UserRepository.verifyEmail')
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
    } catch (_error) {
      this.handleError(_error, 'UserRepository.getByRole')
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
    } catch (_error) {
      this.handleError(_error, 'UserRepository.search')
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
    } catch (_error) {
      this.handleError(_error, 'UserRepository.createNotification')
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
    } catch (_error) {
      this.handleError(_error, 'UserRepository.getNotifications')
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
    } catch (_error) {
      this.handleError(_error, 'UserRepository.getUnreadNotifications')
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
    } catch (_error) {
      this.handleError(_error, 'UserRepository.getUnreadNotificationCount')
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
    } catch (_error) {
      this.handleError(_error, 'UserRepository.getNotificationById')
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
    } catch (_error) {
      this.handleError(_error, 'UserRepository.markNotificationAsRead')
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
    } catch (_error) {
      this.handleError(_error, 'UserRepository.markAllNotificationsAsRead')
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
    } catch (_error) {
      this.handleError(_error, 'UserRepository.deleteNotification')
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
    } catch (_error) {
      this.handleError(_error, 'UserRepository.getUserById')
      return null
    }
  }

  /**
   * Crea un mensaje
   */
  async createMessage(data: { conversationId: string; senderId: string; content: string; fileId?: string }) {
    try {
      const message = await this.client.message.create({
        data: {
          conversationId: data.conversationId,
          senderId: data.senderId,
          content: data.content,
          fileId: data.fileId,
          createdAt: new Date()
        }
      })

      return message
    } catch (_error) {
      this.handleError(_error, 'UserRepository.createMessage')
    }
  }

  /**
   * Obtiene conversaciones de un usuario
   */
  async getConversations(userId: string, limit = 50, skip = 0) {
    try {
      return await this.client.conversation.findMany({
        where: {
          OR: [{ initiatorId: userId }, { receiverId: userId }]
        },
        include: {
          initiator: { include: { profile: true } },
          receiver: { include: { profile: true } },
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        },
        orderBy: { updatedAt: 'desc' },
        take: limit,
        skip
      })
    } catch (_error) {
      this.handleError(_error, 'UserRepository.getConversations')
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
          initiator: { include: { profile: true } },
          receiver: { include: { profile: true } }
        }
      })
    } catch (_error) {
      this.handleError(_error, 'UserRepository.getConversationById')
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
          file: true
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip
      })
    } catch (_error) {
      this.handleError(_error, 'UserRepository.getConversationMessages')
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
          senderId: { not: userId },
          isRead: false
        },
        data: { isRead: true, readAt: new Date() }
      })
    } catch (_error) {
      this.handleError(_error, 'UserRepository.markConversationMessagesAsRead')
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
            { initiatorId: userId1, receiverId: userId2 },
            { initiatorId: userId2, receiverId: userId1 }
          ]
        }
      })
    } catch (_error) {
      this.handleError(_error, 'UserRepository.findConversation')
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
          initiatorId: userId1,
          receiverId: userId2
        }
      })
    } catch (_error) {
      this.handleError(_error, 'UserRepository.createConversation')
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
    } catch (_error) {
      this.handleError(_error, 'UserRepository.deleteConversation')
    }
  }

  /**
   * Busca usuarios
   */
  async searchUsers(query: string, limit = 10) {
    try {
      return await this.client.user.findMany({
        where: {
          OR: [{ email: { contains: query } }, { profile: { name: { contains: query } } }]
        },
        include: { profile: true },
        take: limit
      })
    } catch (_error) {
      this.handleError(_error, 'UserRepository.searchUsers')
      return []
    }
  }

  /**
   * Obtiene las rutas de aprendizaje disponibles para un estudiante
   */
  async getAvailableLearningPaths(_userId: string) {
    try {
      return await this.client.learningPath.findMany({
        where: {
          isPublished: true
        },
        include: {
          instructor: {
            include: {
              user: {
                include: {
                  profile: true
                }
              }
            }
          },
          nodes: true,
          edges: true,
          image: true
        },
        orderBy: { createdAt: 'desc' }
      })
    } catch (_error) {
      this.handleError(_error, 'UserRepository.getAvailableLearningPaths')
      return []
    }
  }

  // ========================================================================
  // TAREAS PERSONALES (PERSONAL TASKS)
  // ========================================================================

  /**
   * Obtiene todas las tareas personales de un usuario
   */
  async getPersonalTasks(userId: string) {
    try {
      return await this.client.personalTask.findMany({
        where: { userId },
        orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }]
      })
    } catch (_error) {
      this.handleError(_error, 'UserRepository.getPersonalTasks')
      return []
    }
  }

  /**
   * Obtiene una tarea personal por ID
   */
  async getPersonalTaskById(taskId: string) {
    try {
      return await this.client.personalTask.findUnique({
        where: { id: taskId }
      })
    } catch (_error) {
      this.handleError(_error, 'UserRepository.getPersonalTaskById')
    }
  }

  /**
   * Crea una nueva tarea personal
   */
  async createPersonalTask(data: {
    userId: string
    title: string
    description?: string
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
    dueDate?: Date
    tags?: string[]
  }) {
    try {
      return await this.client.personalTask.create({
        data: {
          userId: data.userId,
          title: data.title,
          description: data.description,
          priority: data.priority || 'MEDIUM',
          dueDate: data.dueDate,
          tags: data.tags
        }
      })
    } catch (_error) {
      this.handleError(_error, 'UserRepository.createPersonalTask')
    }
  }

  /**
   * Actualiza una tarea personal
   */
  async updatePersonalTask(taskId: string, data: any) {
    try {
      return await this.client.personalTask.update({
        where: { id: taskId },
        data
      })
    } catch (_error) {
      this.handleError(_error, 'UserRepository.updatePersonalTask')
    }
  }

  /**
   * Elimina una tarea personal
   */
  async deletePersonalTask(taskId: string) {
    try {
      return await this.client.personalTask.delete({
        where: { id: taskId }
      })
    } catch (_error) {
      this.handleError(_error, 'UserRepository.deletePersonalTask')
    }
  }
}

export const userRepository = new UserRepository()
