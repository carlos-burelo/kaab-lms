import { CalendarView } from '@/components/calendar/CalendarView'
import { calendarRepository } from '@/database/repositories'
import { getSession } from '@/lib/auth'

export default async function CalendarPage() {
  const session = await getSession()

  const now = new Date()
  const monthEvents = session?.id ? await calendarRepository.getMonthEvents(session.id, now.getFullYear(), now.getMonth()) : []

  return (
    <div className='space-y-6 p-4'>
      <CalendarView initialEvents={monthEvents as any} view='month' />
    </div>
  )
}
