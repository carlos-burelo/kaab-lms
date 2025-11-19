'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Check, CheckCheck } from 'lucide-react'
import { getNotifications, markNotificationsAsRead } from '@/actions/instructor/notification.actions'
import { toast } from 'sonner'

type Notification = {
  id: string
  type: string
  title: string
  message: string
  link: string | null
  isRead: boolean
  createdAt: Date
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadNotifications()
  }, [])

  const loadNotifications = async () => {
    const result = await getNotifications({ limit: 100 })
    if (result.success && result.data) {
      setNotifications(result.data as any)
    }
    setLoading(false)
  }

  const markAllAsRead = async () => {
    const result = await markNotificationsAsRead({})
    if (result.success) {
      toast.success('Todas las notificaciones marcadas como leídas')
      loadNotifications()
    }
  }

  const markAsRead = async (id: string) => {
    const result = await markNotificationsAsRead({ notificationIds: [id] })
    if (result.success) {
      loadNotifications()
    }
  }

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      SYSTEM: 'default',
      COURSE: 'secondary',
      MESSAGE: 'outline',
      ACHIEVEMENT: 'default',
      PAYMENT: 'secondary'
    }
    return colors[type] || 'default'
  }

  return (
    <>
      <header className='border-b border-border flex items-center justify-between p-4'>
        <div>
          <h1 className='text-2xl font-bold text-foreground'>Notificaciones</h1>
          <p className='text-sm text-muted-foreground'>
            Mantente al día con las actualizaciones
          </p>
        </div>
        <Button variant='outline' size='sm' onClick={markAllAsRead}>
          <CheckCheck className='mr-2 h-4 w-4' />
          Marcar todas como leídas
        </Button>
      </header>
      <main className='p-4'>
        {loading ? (
          <div>Cargando notificaciones...</div>
        ) : (
          <ScrollArea className='h-[calc(100vh-12rem)]'>
            <div className='space-y-2'>
              {notifications.length === 0 ? (
                <div className='text-center text-muted-foreground py-8'>
                  No hay notificaciones
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 rounded-lg border ${notification.isRead ? 'bg-background' : 'bg-muted'}`}
                  >
                    <div className='flex items-start justify-between gap-4'>
                      <div className='flex-1'>
                        <div className='flex items-center gap-2 mb-1'>
                          <Badge variant={getTypeColor(notification.type) as any}>
                            {notification.type}
                          </Badge>
                          {!notification.isRead && (
                            <Badge variant='default'>Nuevo</Badge>
                          )}
                        </div>
                        <h3 className='font-medium'>{notification.title}</h3>
                        <p className='text-sm text-muted-foreground mt-1'>
                          {notification.message}
                        </p>
                        <p className='text-xs text-muted-foreground mt-2'>
                          {format(new Date(notification.createdAt), "dd 'de' MMMM 'a las' HH:mm", {
                            locale: es
                          })}
                        </p>
                      </div>
                      {!notification.isRead && (
                        <Button
                          variant='ghost'
                          size='icon'
                          onClick={() => markAsRead(notification.id)}
                        >
                          <Check className='h-4 w-4' />
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        )}
      </main>
    </>
  )
}
