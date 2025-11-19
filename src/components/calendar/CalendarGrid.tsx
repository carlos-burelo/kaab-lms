'use client'

import { ChevronLeft, ChevronRight, Clock, MapPin } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { type CalendarEventBase, CalendarView, type EventType, EventTypeColors } from '@/lib/calendar/calendar-types'
import {
  formatDateReadable,
  getDayName,
  getDayNamesShort,
  getDaysInMonth,
  getMonthName,
  getMonthStart,
  getWeekStart,
  isSameDay,
  isToday
} from '@/lib/calendar/date-utils'

interface CalendarGridProps {
  date: Date
  events: CalendarEventBase[]
  view: CalendarView
  onSelectDate?: (date: Date) => void
  onSelectEvent?: (event: CalendarEventBase) => void
  onNextPeriod?: () => void
  onPreviousPeriod?: () => void
  locale?: string
  highlightToday?: boolean
  showWeekNumbers?: boolean
}

/**
 * Componente de cuadrícula de calendario
 * Soporta vistas: DAY, WEEK, MONTH, YEAR, AGENDA
 */
export function CalendarGrid({
  date,
  events,
  view,
  onSelectDate,
  onSelectEvent,
  onNextPeriod,
  onPreviousPeriod,
  locale = 'es-ES',
  highlightToday = true,
  showWeekNumbers = false
}: CalendarGridProps) {
  const dayNames = getDayNamesShort(locale)
  const monthName = getMonthName(date, locale)

  if (view === CalendarView.MONTH) {
    return (
      <MonthView
        date={date}
        events={events}
        dayNames={dayNames}
        monthName={monthName}
        onSelectDate={onSelectDate}
        onSelectEvent={onSelectEvent}
        onNextPeriod={onNextPeriod}
        onPreviousPeriod={onPreviousPeriod}
        highlightToday={highlightToday}
        showWeekNumbers={showWeekNumbers}
      />
    )
  }

  if (view === CalendarView.WEEK) {
    return (
      <WeekView
        date={date}
        events={events}
        dayNames={dayNames}
        onSelectDate={onSelectDate}
        onSelectEvent={onSelectEvent}
        onNextPeriod={onNextPeriod}
        onPreviousPeriod={onPreviousPeriod}
        highlightToday={highlightToday}
      />
    )
  }

  if (view === CalendarView.DAY) {
    return (
      <DayView
        date={date}
        events={events}
        onSelectEvent={onSelectEvent}
        onNextPeriod={onNextPeriod}
        onPreviousPeriod={onPreviousPeriod}
        highlightToday={highlightToday}
      />
    )
  }

  if (view === CalendarView.AGENDA) {
    return <AgendaView events={events} onSelectEvent={onSelectEvent} />
  }

  return null
}

/**
 * Vista de mes
 */
function MonthView({
  date,
  events,
  dayNames,
  monthName,
  onSelectDate,
  onSelectEvent,
  onNextPeriod,
  onPreviousPeriod,
  highlightToday,
  showWeekNumbers
}: any) {
  const year = date.getFullYear()
  const month = date.getMonth()
  const firstDay = getMonthStart(date)
  const daysInMonth = getDaysInMonth(year, month)
  const startingDayOfWeek = firstDay.getDay()

  const days: (number | null)[] = [
    ...Array(startingDayOfWeek).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1)
  ]

  const getEventsForDay = (day: number) => {
    const dayDate = new Date(year, month, day, 0, 0, 0, 0)
    return events.filter(
      (event: CalendarEventBase) =>
        isSameDay(new Date(event.startDate), dayDate) ||
        (new Date(event.startDate) <= dayDate && dayDate <= new Date(event.endDate))
    )
  }

  return (
    <div className='space-y-4'>
      {/* Header */}
      <div className='flex items-center justify-between mb-6'>
        <h2 className='text-2xl font-bold'>
          {monthName} {year}
        </h2>
        <div className='flex gap-2'>
          <Button variant='outline' size='icon' onClick={onPreviousPeriod}>
            <ChevronLeft className='w-4 h-4' />
          </Button>
          <Button variant='outline' size='icon' onClick={onNextPeriod}>
            <ChevronRight className='w-4 h-4' />
          </Button>
        </div>
      </div>

      {/* Day names */}
      <div className='grid grid-cols-7 gap-2 mb-2'>
        {showWeekNumbers && <div className='text-xs font-semibold text-gray-500'>Week</div>}
        {dayNames.map((day: string) => (
          <div key={day} className='text-xs font-semibold text-center text-gray-600 py-2'>
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className='grid grid-cols-7 gap-2'>
        {days.map((day, idx) => {
          const isToday_ = day && isToday(new Date(year, month, day))

          return (
            <div
              key={`${day}-${idx}`}
              className={`
                min-h-24 p-2 rounded-lg border-2 cursor-pointer transition-all
                ${!day ? 'bg-gray-50 border-transparent' : 'border-gray-200 hover:border-blue-300'}
                ${isToday_ && highlightToday ? 'bg-blue-50 border-blue-300' : 'bg-white'}
              `}
              onClick={() => day && onSelectDate?.(new Date(year, month, day))}
            >
              {day && (
                <div className='space-y-1'>
                  <div className={`text-sm font-semibold ${isToday_ ? 'text-blue-600' : 'text-gray-700'}`}>{day}</div>
                  <div className='space-y-1'>
                    {getEventsForDay(day)
                      .slice(0, 2)
                      .map((event: CalendarEventBase) => (
                        <EventBadge key={event.id} event={event} onClick={() => onSelectEvent?.(event)} />
                      ))}
                    {getEventsForDay(day).length > 2 && (
                      <div className='text-xs text-gray-500'>+{getEventsForDay(day).length - 2} more</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/**
 * Vista de semana
 */
function WeekView({ date, events, onSelectDate, onSelectEvent, onNextPeriod, onPreviousPeriod, highlightToday = true }: any) {
  const weekStart = getWeekStart(date)
  const days = Array.from({ length: 7 }, (_, i) => new Date(weekStart.getTime() + i * 24 * 60 * 60 * 1000))

  return (
    <div className='space-y-4'>
      {/* Header */}
      <div className='flex items-center justify-between mb-6'>
        <h2 className='text-2xl font-bold'>Week of {formatDateReadable(weekStart)}</h2>
        <div className='flex gap-2'>
          <Button variant='outline' size='icon' onClick={onPreviousPeriod}>
            <ChevronLeft className='w-4 h-4' />
          </Button>
          <Button variant='outline' size='icon' onClick={onNextPeriod}>
            <ChevronRight className='w-4 h-4' />
          </Button>
        </div>
      </div>

      {/* Week grid */}
      <div className='grid grid-cols-7 gap-2'>
        {days.map((dayDate, idx) => {
          const dayEvents = events.filter(
            (event: CalendarEventBase) =>
              isSameDay(new Date(event.startDate), dayDate) ||
              (new Date(event.startDate) <= dayDate && dayDate <= new Date(event.endDate))
          )
          const isToday_ = isToday(dayDate)

          return (
            <div
              key={idx}
              className={`
                min-h-80 p-3 rounded-lg border-2 cursor-pointer transition-all
                ${isToday_ && highlightToday ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-200'}
              `}
              onClick={() => onSelectDate?.(dayDate)}
            >
              <div className={`text-sm font-semibold mb-2 ${isToday_ ? 'text-blue-600' : 'text-gray-700'}`}>
                {getDayName(dayDate).substring(0, 3)} {dayDate.getDate()}
              </div>
              <div className='space-y-2'>
                {dayEvents.map((event: CalendarEventBase) => (
                  <EventCard key={event.id} event={event} onClick={() => onSelectEvent?.(event)} />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/**
 * Vista de día
 */
function DayView({ date, events, onSelectEvent, onNextPeriod, onPreviousPeriod }: any) {
  const dayEvents = events.filter((event: CalendarEventBase) => isSameDay(new Date(event.startDate), date))

  const hours = Array.from({ length: 24 }, (_, i) => i)

  return (
    <div className='space-y-4'>
      {/* Header */}
      <div className='flex items-center justify-between mb-6'>
        <h2 className='text-2xl font-bold'>{formatDateReadable(date)}</h2>
        <div className='flex gap-2'>
          <Button variant='outline' size='icon' onClick={onPreviousPeriod}>
            <ChevronLeft className='w-4 h-4' />
          </Button>
          <Button variant='outline' size='icon' onClick={onNextPeriod}>
            <ChevronRight className='w-4 h-4' />
          </Button>
        </div>
      </div>

      {/* Hour grid */}
      <div className='space-y-2'>
        {hours.map((hour) => (
          <div key={hour} className='flex gap-4'>
            <div className='w-16 text-sm font-semibold text-gray-600'>{String(hour).padStart(2, '0')}:00</div>
            <div className='flex-1 min-h-16 p-2 rounded-lg border border-gray-200 bg-white'>
              {dayEvents
                .filter((event: CalendarEventBase) => {
                  const eventHour = new Date(event.startDate).getHours()
                  return eventHour === hour
                })
                .map((event: CalendarEventBase) => (
                  <EventCard key={event.id} event={event} onClick={() => onSelectEvent?.(event)} />
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Vista de agenda (lista)
 */
function AgendaView({ events, onSelectEvent }: any) {
  const sortedEvents = [...events].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())

  return (
    <div className='space-y-4'>
      <h2 className='text-2xl font-bold'>Upcoming Events</h2>

      {sortedEvents.length === 0 ? (
        <Card className='p-8 text-center text-gray-500'>No events scheduled</Card>
      ) : (
        <div className='space-y-2'>
          {sortedEvents.map((event: CalendarEventBase) => (
            <div
              key={event.id}
              className='p-4 rounded-lg border border-gray-200 bg-white hover:shadow-md cursor-pointer transition-all'
              onClick={() => onSelectEvent?.(event)}
            >
              <div className='flex items-start justify-between'>
                <div className='flex-1'>
                  <div className='flex items-center gap-2'>
                    <div
                      className='w-3 h-3 rounded-full'
                      style={{ backgroundColor: event.color || EventTypeColors[event.type as EventType] }}
                    />
                    <h3 className='font-semibold'>{event.title}</h3>
                    <Badge variant='secondary' className='text-xs'>
                      {event.type}
                    </Badge>
                  </div>
                  {event.description && <p className='text-sm text-gray-600 mt-1'>{event.description}</p>}
                  <div className='flex items-center gap-4 mt-2 text-sm text-gray-500'>
                    <div className='flex items-center gap-1'>
                      <Clock className='w-4 h-4' />
                      {new Date(event.startDate).toLocaleString()}
                    </div>
                    {event.location && (
                      <div className='flex items-center gap-1'>
                        <MapPin className='w-4 h-4' />
                        {event.location}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * Componente de evento en badge (pequeño)
 */
function EventBadge({ event, onClick }: { event: CalendarEventBase; onClick?: () => void }) {
  return (
    <div
      className='text-xs p-1 rounded truncate cursor-pointer hover:opacity-80'
      style={{
        backgroundColor: event.color || EventTypeColors[event.type as EventType],
        color: 'white'
      }}
      onClick={(e) => {
        e.stopPropagation()
        onClick?.()
      }}
    >
      {event.title}
    </div>
  )
}

/**
 * Componente de evento en tarjeta
 */
function EventCard({ event, onClick }: { event: CalendarEventBase; onClick?: () => void }) {
  return (
    <div
      className='p-2 rounded border text-sm cursor-pointer hover:shadow-md transition-all'
      style={{
        backgroundColor: event.color || EventTypeColors[event.type as EventType],
        borderColor: event.color || EventTypeColors[event.type as EventType],
        color: 'white'
      }}
      onClick={onClick}
    >
      <div className='font-semibold truncate'>{event.title}</div>
      <div className='text-xs opacity-90'>{formatDateReadable(new Date(event.startDate))}</div>
    </div>
  )
}

export { EventBadge, EventCard }
