import type { Metadata } from 'next'
import { Suspense } from 'react'
import { getNotifications, getUnreadNotificationCount } from '@/actions/notification.actions'
import { NotificationsList } from '@/components/notifications/NotificationsList'
import { Card, CardContent, CardHeader, } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export const metadata: Metadata = {
  title: 'Notificaciones',
  description: 'Centro de notificaciones'
}

export default async function NotificationsPage() {
  const [notificationsResult, unreadCountResult] = await Promise.all([
    getNotifications(50),
    getUnreadNotificationCount()
  ])

  const notifications = notificationsResult.success ? (notificationsResult.data as any) : []
  const unreadCount = (unreadCountResult.success ? unreadCountResult.data : 0) || 0

  return (
    <div className='container mx-auto py-6 space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Notificaciones</h1>
          <p className='text-muted-foreground'>
            {unreadCount > 0 ? `Tienes ${unreadCount} notificación${unreadCount > 1 ? 'es' : ''} sin leer` : 'Estás al día con tus notificaciones'}
          </p>
        </div>
      </div>

      <Suspense fallback={<NotificationsSkeleton />}>
        <NotificationsList initialNotifications={notifications || []} />
      </Suspense>
    </div>
  )
}

function NotificationsSkeleton() {
  return (
    <div className='space-y-4'>
      {[...Array(5)].map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className='h-4 w-3/4' />
            <Skeleton className='h-3 w-1/2' />
          </CardHeader>
          <CardContent>
            <Skeleton className='h-3 w-full' />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
