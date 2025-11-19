'use client'

import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { Award, Bell, BookOpen, CheckCheck, Clock, CreditCard, MessageSquare, Target, Trash2, Trophy, Users } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { deleteNotification, markAllNotificationsAsRead, markNotificationAsRead } from '@/actions/notification.actions'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type Notification = {
  id: string
  type: string
  title: string
  message: string
  link?: string | null
  data?: any
  isRead: boolean
  readAt?: Date | null
  createdAt: Date
}

interface NotificationsListProps {
  initialNotifications: Notification[]
}

const getNotificationIcon = (type: string) => {
  const icons: Record<string, any> = {
    SYSTEM: Bell,
    COURSE: BookOpen,
    MESSAGE: MessageSquare,
    ACHIEVEMENT: Trophy,
    BADGE: Award,
    MISSION: Target,
    PAYMENT: CreditCard,
    REMINDER: Clock,
    SOCIAL: Users
  }
  return icons[type] || Bell
}

const getNotificationColor = (type: string) => {
  const colors: Record<string, string> = {
    SYSTEM: 'text-blue-500',
    COURSE: 'text-green-500',
    MESSAGE: 'text-purple-500',
    ACHIEVEMENT: 'text-yellow-500',
    BADGE: 'text-orange-500',
    MISSION: 'text-pink-500',
    PAYMENT: 'text-emerald-500',
    REMINDER: 'text-red-500',
    SOCIAL: 'text-indigo-500'
  }
  return colors[type] || 'text-gray-500'
}

export function NotificationsList({ initialNotifications }: NotificationsListProps) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications)
  const router = useRouter()

  const handleMarkAsRead = async (notificationId: string) => {
    const result = await markNotificationAsRead(notificationId)
    if (result.success) {
      setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, isRead: true, readAt: new Date() } : n)))
      router.refresh()
    }
  }

  const handleMarkAllAsRead = async () => {
    const result = await markAllNotificationsAsRead()
    if (result.success) {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true, readAt: new Date() })))
      router.refresh()
    }
  }

  const handleDelete = async (notificationId: string) => {
    const result = await deleteNotification(notificationId)
    if (result.success) {
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId))
      router.refresh()
    }
  }

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      await handleMarkAsRead(notification.id)
    }
    if (notification.link) {
      router.push(notification.link)
    }
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length

  if (notifications.length === 0) {
    return (
      <Card>
        <CardContent className='flex flex-col items-center justify-center py-12'>
          <Bell className='h-12 w-12 text-muted-foreground mb-4' />
          <p className='text-muted-foreground text-center'>No tienes notificaciones</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className='space-y-4'>
      {unreadCount > 0 && (
        <div className='flex justify-end'>
          <Button variant='outline' size='sm' onClick={handleMarkAllAsRead}>
            <CheckCheck className='h-4 w-4 mr-2' />
            Marcar todas como leídas
          </Button>
        </div>
      )}

      <div className='space-y-3'>
        {notifications.map((notification) => {
          const Icon = getNotificationIcon(notification.type)
          const iconColor = getNotificationColor(notification.type)

          return (
            <Card
              key={notification.id}
              className={cn(
                'transition-all hover:shadow-md cursor-pointer',
                !notification.isRead && 'border-l-4 border-l-primary bg-primary/5'
              )}
            >
              <CardHeader className='pb-3'>
                <div className='flex items-start justify-between gap-4'>
                  <div className='flex items-start gap-4 flex-1'>
                    <div className={cn('p-2 rounded-lg bg-background', iconColor)}>
                      <Icon className='h-5 w-5' />
                    </div>
                    <div className='flex-1 space-y-1' onClick={() => handleNotificationClick(notification)}>
                      <div className='flex items-center gap-2'>
                        <CardTitle className='text-base'>{notification.title}</CardTitle>
                        {!notification.isRead && (
                          <Badge variant='default' className='text-xs'>
                            Nuevo
                          </Badge>
                        )}
                      </div>
                      <CardDescription className='text-sm'>{notification.message}</CardDescription>
                      <p className='text-xs text-muted-foreground'>
                        {formatDistanceToNow(new Date(notification.createdAt), {
                          addSuffix: true,
                          locale: es
                        })}
                      </p>
                    </div>
                  </div>
                  <div className='flex items-center gap-2'>
                    {!notification.isRead && (
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={(e) => {
                          e.stopPropagation()
                          handleMarkAsRead(notification.id)
                        }}
                      >
                        <CheckCheck className='h-4 w-4' />
                      </Button>
                    )}
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(notification.id)
                      }}
                    >
                      <Trash2 className='h-4 w-4 text-destructive' />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
