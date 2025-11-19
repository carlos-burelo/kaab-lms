'use client'

import { Bell, CheckCheck, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import {
  deleteNotification,
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsAsRead,
  markNotificationAsRead
} from '@/actions/notification.actions'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const fetchNotifications = useCallback(async () => {
    const result = await getNotifications(20)
    if (result.success) {
      setNotifications(result.data)
    }
  }, [])

  const fetchUnreadCount = useCallback(async () => {
    const result = await getUnreadNotificationCount()
    if (result.success) {
      setUnreadCount(result.data)
    }
  }, [])

  useEffect(() => {
    fetchNotifications()
    fetchUnreadCount()

    const interval = setInterval(fetchUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [fetchNotifications, fetchUnreadCount])

  async function handleMarkAsRead(notificationId: string) {
    await markNotificationAsRead(notificationId)
    setNotifications((prev) => prev.map((notif) => (notif.id === notificationId ? { ...notif, isRead: true } : notif)))
    setUnreadCount((prev) => Math.max(0, prev - 1))
  }

  async function handleMarkAllAsRead() {
    setIsLoading(true)
    await markAllNotificationsAsRead()
    setNotifications((prev) => prev.map((notif) => ({ ...notif, isRead: true })))
    setUnreadCount(0)
    setIsLoading(false)
  }

  async function handleDelete(notificationId: string) {
    await deleteNotification(notificationId)
    setNotifications((prev) => prev.filter((notif) => notif.id !== notificationId))
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'ACHIEVEMENT':
        return '🏆'
      case 'BADGE':
        return '⭐'
      case 'MISSION':
        return '✨'
      case 'MESSAGE':
        return '💬'
      case 'COURSE':
        return '📚'
      case 'REMINDER':
        return '⏰'
      case 'PAYMENT':
        return '💳'
      default:
        return '📢'
    }
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='icon' className='relative'>
          <Bell className='h-5 w-5' />
          {unreadCount > 0 && (
            <span className='absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white'>
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-96'>
        <div className='flex items-center justify-between px-4 py-3'>
          <h3 className='font-semibold'>Notificaciones</h3>
          {unreadCount > 0 && (
            <Button variant='ghost' size='sm' onClick={handleMarkAllAsRead} disabled={isLoading} className='gap-1 text-xs'>
              <CheckCheck className='h-3 w-3' />
              Marcar todas como leídas
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />
        <ScrollArea className='h-96'>
          {notifications.length === 0 ? (
            <div className='flex h-full items-center justify-center text-center text-sm text-muted-foreground'>
              <p>No tienes notificaciones</p>
            </div>
          ) : (
            <div className='divide-y'>
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex gap-3 px-4 py-3 transition-colors ${
                    notification.isRead ? 'bg-background' : 'bg-blue-50 dark:bg-blue-950'
                  } hover:bg-muted`}
                >
                  <div className='text-xl'>{getNotificationIcon(notification.type)}</div>
                  <div className='flex-1 min-w-0'>
                    <p className='font-medium text-sm'>{notification.title}</p>
                    <p className='text-sm text-muted-foreground line-clamp-2'>{notification.message}</p>
                    <p className='text-xs text-muted-foreground mt-1'>
                      {new Date(notification.createdAt).toLocaleDateString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className='flex gap-1'>
                    {!notification.isRead && (
                      <Button variant='ghost' size='sm' onClick={() => handleMarkAsRead(notification.id)} className='h-6 w-6 p-0'>
                        <CheckCheck className='h-3 w-3' />
                      </Button>
                    )}
                    <Button variant='ghost' size='sm' onClick={() => handleDelete(notification.id)} className='h-6 w-6 p-0'>
                      <Trash2 className='h-3 w-3' />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
