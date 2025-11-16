'use client'

import { useCallback } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { generateAchievementMessage, generateLevelUpMessage } from '@/lib/gamification-utils'

interface GamificationNotificationProps {
  type: 'xp_gained' | 'level_up' | 'badge_earned' | 'achievement_completed' | 'reward_claimed' | 'mission_completed'
  data?: {
    amount?: number
    name?: string
    level?: number
    coins?: number
  }
}

/**
 * Hook para mostrar notificaciones de gamificación
 */
export function useGamificationNotifications() {
  const { toast } = useToast()

  const showNotification = useCallback(
    ({ type, data }: GamificationNotificationProps) => {
      switch (type) {
        case 'xp_gained':
          toast({
            title: '⭐ XP Ganado',
            description: `Obtuviste +${data?.amount || 0} XP`,
            variant: 'default'
          })
          break

        case 'level_up':
          toast({
            title: '🎉 ¡Nuevo Nivel!',
            description: generateLevelUpMessage(data?.level || 1),
            variant: 'default',
            duration: 5000
          })
          break

        case 'badge_earned':
          toast({
            title: '🏆 Insígnia Desbloqueada',
            description: `Conseguiste la insígnia "${data?.name}"`,
            variant: 'default'
          })
          break

        case 'achievement_completed':
          toast({
            title: '🎯 Logro Completado',
            description: generateAchievementMessage(data?.name || 'Logro', data?.amount || 0, data?.coins),
            variant: 'default',
            duration: 5000
          })
          break

        case 'reward_claimed':
          toast({
            title: '🎁 Recompensa Reclamada',
            description: `¡Obtuviste "${data?.name}"! -${data?.amount || 0} coins`,
            variant: 'default'
          })
          break

        case 'mission_completed':
          toast({
            title: '✅ Misión Completada',
            description: `Completaste "${data?.name}" y ganaste +${data?.amount || 0} XP`,
            variant: 'default'
          })
          break
      }
    },
    [toast]
  )

  return { showNotification }
}
