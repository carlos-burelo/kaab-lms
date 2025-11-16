'use client'

import { AnimatePresence, motion } from 'framer-motion'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { Button } from '../ui/button'

interface AchievementNotificationProps {
  show: boolean
  name: string
  description?: string
  icon?: string
  xpReward: number
  coinReward?: number
  onClose?: () => void
  autoClose?: boolean
  autoCloseDuration?: number
}

export function AchievementNotification({
  show,
  name,
  description,
  icon,
  xpReward,
  coinReward,
  onClose,
  autoClose = true,
  autoCloseDuration = 5000
}: AchievementNotificationProps) {
  const [isVisible, setIsVisible] = useState(show)

  useEffect(() => {
    setIsVisible(show)

    if (show && autoClose) {
      const timer = setTimeout(() => {
        setIsVisible(false)
        onClose?.()
      }, autoCloseDuration)

      return () => clearTimeout(timer)
    }
  }, [show, autoClose, autoCloseDuration, onClose])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className='fixed top-4 right-4 z-50'
        >
          <div className='bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg shadow-2xl overflow-hidden max-w-md'>
            <div className='p-6 text-white'>
              {/* Icon */}
              {icon && (
                <div className='flex justify-center mb-4'>
                  <Image src={icon} alt={name} width={64} height={64} className='rounded-full' />
                </div>
              )}

              {/* Title */}
              <h3 className='text-lg font-bold text-center mb-2'>🏆 Logro Desbloqueado</h3>

              {/* Achievement Name */}
              <p className='text-center text-xl font-bold mb-2'>{name}</p>

              {/* Description */}
              {description && <p className='text-center text-sm opacity-90 mb-4'>{description}</p>}

              {/* Rewards */}
              <div className='flex items-center justify-center gap-4 mb-4'>
                <div className='bg-white/20 px-4 py-2 rounded-full'>
                  <p className='text-sm font-semibold'>⭐ +{xpReward} XP</p>
                </div>

                {coinReward && coinReward > 0 && (
                  <div className='bg-white/20 px-4 py-2 rounded-full'>
                    <p className='text-sm font-semibold'>💰 +{coinReward} Coins</p>
                  </div>
                )}
              </div>

              {/* Close Button */}
              <Button
                onClick={() => {
                  setIsVisible(false)
                  onClose?.()
                }}
                className='w-full bg-white/30 hover:bg-white/40 text-white font-semibold py-2 rounded-lg transition-colors'
              >
                Continuar
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
