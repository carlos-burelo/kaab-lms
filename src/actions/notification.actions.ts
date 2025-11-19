'use server'

import { revalidatePath } from 'next/cache'
import z from 'zod'
import { userRepository } from '@/database/repositories'
import { getSession } from '@/lib/auth'

// ============================================================================
// SCHEMAS - VALIDACIÓN
// ============================================================================

const CreateNotificationSchema = z.object({
  userId: z.string().min(1),
  type: z.enum(['SYSTEM', 'COURSE', 'MESSAGE', 'ACHIEVEMENT', 'BADGE', 'MISSION', 'PAYMENT', 'REMINDER', 'SOCIAL']),
  title: z.string().min(1),
  message: z.string().min(1),
  resourceId: z.string().optional(),
  resourceType: z.string().optional(),
  data: z.record(z.string(), z.any()).optional()
})

const MarkAsReadSchema = z.object({
  notificationId: z.string().min(1)
})

// ============================================================================
// CREAR NOTIFICACIÓN (INTERNAL)
// ============================================================================

export async function createNotification(data: z.infer<typeof CreateNotificationSchema>) {
  try {
    const validated = CreateNotificationSchema.parse(data)

    const notification = await userRepository.createNotification({
      userId: validated.userId,
      type: validated.type as any,
      title: validated.title,
      message: validated.message,
      resourceId: validated.resourceId,
      resourceType: validated.resourceType,
      data: validated.data
    })

    revalidatePath('/estudiante')
    revalidatePath('/instructor')
    return { success: true, data: notification }
  } catch (_error) {
    const message = _error instanceof Error ? _error.message : 'Error al crear notificación'
    return { success: false, error: message }
  }
}

// ============================================================================
// OBTENER NOTIFICACIONES
// ============================================================================

export async function getNotifications(limit: number = 20) {
  try {
    const user = await getSession()
    if (!user?.id) {
      throw new Error('No autenticado')
    }

    const notifications = await userRepository.getNotifications(user.id, limit)
    return { success: true, data: notifications }
  } catch (_error) {
    const message = _error instanceof Error ? _error.message : 'Error al obtener notificaciones'
    return { success: false, error: message }
  }
}

// ============================================================================
// OBTENER NOTIFICACIONES NO LEÍDAS
// ============================================================================

export async function getUnreadNotifications() {
  try {
    const user = await getSession()
    if (!user?.id) {
      throw new Error('No autenticado')
    }

    const notifications = await userRepository.getUnreadNotifications(user.id)
    return { success: true, data: notifications }
  } catch (_error) {
    const message = _error instanceof Error ? _error.message : 'Error al obtener notificaciones'
    return { success: false, error: message }
  }
}

// ============================================================================
// CONTAR NOTIFICACIONES NO LEÍDAS
// ============================================================================

export async function getUnreadNotificationCount() {
  try {
    const user = await getSession()
    if (!user?.id) {
      throw new Error('No autenticado')
    }

    const count = await userRepository.getUnreadNotificationCount(user.id)
    return { success: true, data: count }
  } catch (_error) {
    const message = _error instanceof Error ? _error.message : 'Error al contar notificaciones'
    return { success: false, error: message }
  }
}

// ============================================================================
// MARCAR NOTIFICACIÓN COMO LEÍDA
// ============================================================================

export async function markNotificationAsRead(notificationId: string) {
  try {
    const user = await getSession()
    if (!user?.id) {
      throw new Error('No autenticado')
    }

    const validated = MarkAsReadSchema.parse({ notificationId })

    // Verificar que la notificación pertenece al usuario
    const notification = await userRepository.getNotificationById(validated.notificationId)
    if (!notification || notification.userId !== user.id) {
      throw new Error('No tienes permiso para marcar esta notificación')
    }

    const updated = await userRepository.markNotificationAsRead(validated.notificationId)

    return { success: true, data: updated }
  } catch (_error) {
    const message = _error instanceof Error ? _error.message : 'Error al actualizar notificación'
    return { success: false, error: message }
  }
}

// ============================================================================
// MARCAR TODAS LAS NOTIFICACIONES COMO LEÍDAS
// ============================================================================

export async function markAllNotificationsAsRead() {
  try {
    const user = await getSession()
    if (!user?.id) {
      throw new Error('No autenticado')
    }

    await userRepository.markAllNotificationsAsRead(user.id)

    return { success: true }
  } catch (_error) {
    const message = _error instanceof Error ? _error.message : 'Error al actualizar notificaciones'
    return { success: false, error: message }
  }
}

// ============================================================================
// ELIMINAR NOTIFICACIÓN
// ============================================================================

export async function deleteNotification(notificationId: string) {
  try {
    const user = await getSession()
    if (!user?.id) {
      throw new Error('No autenticado')
    }

    // Verificar que la notificación pertenece al usuario
    const notification = await userRepository.getNotificationById(notificationId)
    if (!notification || notification.userId !== user.id) {
      throw new Error('No tienes permiso para eliminar esta notificación')
    }

    await userRepository.deleteNotification(notificationId)

    return { success: true }
  } catch (_error) {
    const message = _error instanceof Error ? _error.message : 'Error al eliminar notificación'
    return { success: false, error: message }
  }
}

// ============================================================================
// NOTIFICACIONES DE LOGROS (GAMIFICACIÓN)
// ============================================================================

export async function notifyAchievementUnlocked(userId: string, achievementTitle: string) {
  try {
    return await createNotification({
      userId,
      type: 'ACHIEVEMENT',
      title: '🏆 Logro Desbloqueado',
      message: `¡Felicitaciones! Has desbloqueado el logro: ${achievementTitle}`,
      resourceType: 'ACHIEVEMENT'
    })
  } catch (_error) {
    const message = _error instanceof Error ? _error.message : 'Error al crear notificación'
    return { success: false, error: message }
  }
}

// ============================================================================
// NOTIFICACIONES DE INSIGNIAS
// ============================================================================

export async function notifyBadgeEarned(userId: string, badgeTitle: string) {
  try {
    return await createNotification({
      userId,
      type: 'BADGE',
      title: '⭐ Insignia Desbloqueada',
      message: `¡Excelente! Has ganado la insignia: ${badgeTitle}`,
      resourceType: 'BADGE'
    })
  } catch (_error) {
    const message = _error instanceof Error ? _error.message : 'Error al crear notificación'
    return { success: false, error: message }
  }
}

// ============================================================================
// NOTIFICACIONES DE MISIONES
// ============================================================================

export async function notifyMissionCompleted(userId: string, missionTitle: string) {
  try {
    return await createNotification({
      userId,
      type: 'MISSION',
      title: '✨ Misión Completada',
      message: `Has completado la misión: ${missionTitle}`,
      resourceType: 'MISSION'
    })
  } catch (_error) {
    const message = _error instanceof Error ? _error.message : 'Error al crear notificación'
    return { success: false, error: message }
  }
}

// ============================================================================
// NOTIFICACIONES DE CURSOS
// ============================================================================

export async function notifyAssignmentGraded(userId: string, assignmentTitle: string, courseId: string) {
  try {
    return await createNotification({
      userId,
      type: 'COURSE',
      title: '📝 Asignación Calificada',
      message: `Tu asignación "${assignmentTitle}" ha sido calificada`,
      resourceId: courseId,
      resourceType: 'COURSE'
    })
  } catch (_error) {
    const message = _error instanceof Error ? _error.message : 'Error al crear notificación'
    return { success: false, error: message }
  }
}

// ============================================================================
// NOTIFICACIONES DE MENSAJES
// ============================================================================

export async function notifyNewMessage(userId: string, senderName: string) {
  try {
    return await createNotification({
      userId,
      type: 'MESSAGE',
      title: '💬 Nuevo Mensaje',
      message: `${senderName} te ha enviado un mensaje`,
      resourceType: 'MESSAGE'
    })
  } catch (_error) {
    const message = _error instanceof Error ? _error.message : 'Error al crear notificación'
    return { success: false, error: message }
  }
}

// ============================================================================
// NOTIFICACIONES DE RECORDATORIOS
// ============================================================================

export async function notifyAssignmentDueDate(userId: string, assignmentTitle: string, daysLeft: number) {
  try {
    const message = daysLeft === 0 ? `La asignación vence hoy` : `La asignación vence en ${daysLeft} días`

    return await createNotification({
      userId,
      type: 'REMINDER',
      title: '⏰ Recordatorio de Asignación',
      message: `${assignmentTitle}: ${message}`,
      resourceType: 'ASSIGNMENT'
    })
  } catch (_error) {
    const message = _error instanceof Error ? _error.message : 'Error al crear notificación'
    return { success: false, error: message }
  }
}
