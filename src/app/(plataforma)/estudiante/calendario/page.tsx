import { Metadata } from 'next'
import { Suspense } from 'react'
import { getCalendarEvents } from '@/actions/student/calendar.actions'
import { CalendarView } from '@/components/calendar/CalendarView'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { startOfMonth, endOfMonth } from 'date-fns'

export const metadata: Metadata = {
  title: 'Mi Calendario',
  description: 'Calendario de eventos y actividades'
}

export default async function CalendarPage() {
  const now = new Date()
  const start = startOfMonth(now)
  const end = endOfMonth(now)

  const eventsResult = await getCalendarEvents({
    startDate: start.toISOString(),
    endDate: end.toISOString()
  })

  const events = eventsResult.success ? eventsResult.data : []

  return (
    <div className='container mx-auto py-6 space-y-6'>
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>Mi Calendario</h1>
        <p className='text-muted-foreground'>Visualiza y gestiona tus eventos y actividades</p>
      </div>

      <Suspense fallback={<CalendarSkeleton />}>
        <CalendarView initialEvents={events || []} />
      </Suspense>
    </div>
  )
}

function CalendarSkeleton() {
  return (
    <Card>
      <CardContent className='p-6'>
        <Skeleton className='h-[600px] w-full' />
      </CardContent>
    </Card>
  )
}
