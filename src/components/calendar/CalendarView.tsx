'use client'

import { AlertCircle, Calendar, ChevronLeft, ChevronRight, Clock, Filter, Loader2, Plus, Search, Settings, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState, useTransition } from 'react'
import { deleteEvent, getEvents } from '@/actions/calendar.actions'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { CardDescription, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import type { BlockedTime } from '@/lib/calendar/calendar-types'
import { BlockType } from '@/lib/calendar/calendar-types'
import { EventDetailModal } from './EventDetailModal'
import { EventFormModal } from './EventFormModal'

interface CalendarEvent {
  id: string
  title: string
  description?: string
  startDate: Date | string
  endDate: Date | string
  allDay: boolean
  location?: string
  color?: string
  type: string
  createdAt: Date | string
}

interface CalendarViewProps {
  initialEvents: CalendarEvent[]
  view?: 'month' | 'week' | 'day'
  blockedTimes?: BlockedTime[]
  visibleHours?: any // VisibleHoursRange
  config?: any // CalendarUserConfig
}

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
]

const _EVENT_COLORS = {
  PERSONAL: 'bg-blue-500 hover:bg-blue-600',
  COURSE: 'bg-purple-500 hover:bg-purple-600',
  MEETING: 'bg-pink-500 hover:bg-pink-600',
  SUBMISSION: 'bg-amber-500 hover:bg-amber-600',
  EXAM: 'bg-red-500 hover:bg-red-600',
  OTHER: 'bg-gray-500 hover:bg-gray-600'
}

const _EVENT_COLORS_HEX = {
  PERSONAL: '#3b82f6',
  COURSE: '#8b5cf6',
  MEETING: '#ec4899',
  SUBMISSION: '#f59e0b',
  EXAM: '#ef4444',
  OTHER: '#6b7280'
}

const EVENT_COLORS_TAILWIND = {
  PERSONAL: 'bg-blue-500',
  COURSE: 'bg-purple-500',
  MEETING: 'bg-pink-500',
  SUBMISSION: 'bg-amber-500',
  EXAM: 'bg-red-500',
  OTHER: 'bg-gray-500'
}

const EVENT_BORDER_COLORS = {
  PERSONAL: 'border-l-blue-500',
  COURSE: 'border-l-purple-500',
  MEETING: 'border-l-pink-500',
  SUBMISSION: 'border-l-amber-500',
  EXAM: 'border-l-red-500',
  OTHER: 'border-l-gray-500'
}

const EVENT_LEGEND_COLORS = {
  PERSONAL: 'bg-blue-500',
  COURSE: 'bg-purple-500',
  MEETING: 'bg-pink-500',
  SUBMISSION: 'bg-amber-500',
  EXAM: 'bg-red-500',
  OTHER: 'bg-gray-500'
}

const getEventColorClass = (type: string): string => {
  return (EVENT_COLORS_TAILWIND as Record<string, string>)[type] || EVENT_COLORS_TAILWIND.OTHER
}

const getEventBorderColorClass = (type: string): string => {
  return (EVENT_BORDER_COLORS as Record<string, string>)[type] || EVENT_BORDER_COLORS.OTHER
}

const getEventLegendColorClass = (type: string): string => {
  return (EVENT_LEGEND_COLORS as Record<string, string>)[type] || EVENT_LEGEND_COLORS.OTHER
}

export function CalendarView({
  initialEvents,
  view = 'month',
  blockedTimes: initialBlockedTimes = [],
  visibleHours: initialVisibleHours,
  config: initialConfig
}: CalendarViewProps) {
  const [isPending, startTransition] = useTransition()
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>(view)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [showFormModal, setShowFormModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('ALL')
  const [showConfigPanel, setShowConfigPanel] = useState(false)

  // Configuration data from props (read-only in this component)
  const blockedTimes = initialBlockedTimes ?? []
  const visibleHours = initialVisibleHours
  const config = initialConfig

  // Load events when view or date changes
  useEffect(() => {
    startTransition(async () => {
      const result = await getEvents({
        type: viewMode,
        year: currentDate.getFullYear(),
        month: currentDate.getMonth(),
        date: currentDate,
        days: 7
      })
      if (result.success && result.data) {
        setEvents(result.data)
      }
    })
  }, [viewMode, currentDate])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'n') {
          e.preventDefault()
          setShowFormModal(true)
        }
      }
      if (e.key === 'ArrowLeft') setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
      if (e.key === 'ArrowRight') setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentDate])

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  const handleDeleteEvent = (eventId: string) => {
    startTransition(async () => {
      const result = await deleteEvent(eventId)

      if (result.success) {
        setEvents(events.filter((e) => e.id !== eventId))
        setSuccess('Evento eliminado exitosamente')
        setDeleteConfirm(null)
        setTimeout(() => setSuccess(null), 3000)
      } else {
        setError(result.error || 'Error al eliminar el evento')
      }
    })
  }

  // Filtered and searched events
  const filteredEvents = useMemo(() => {
    let filtered = events

    // Filter by type
    if (filterType !== 'ALL') {
      filtered = filtered.filter((event) => event.type === filterType)
    }

    // Search by title/description
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(query) ||
          event.description?.toLowerCase().includes(query) ||
          event.location?.toLowerCase().includes(query)
      )
    }

    return filtered
  }, [events, filterType, searchQuery])

  // Event statistics
  const eventStats = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    return {
      total: filteredEvents.length,
      today: filteredEvents.filter((e) => {
        const start = new Date(e.startDate)
        return start >= today && start < tomorrow
      }).length,
      upcoming: filteredEvents.filter((e) => {
        const start = new Date(e.startDate)
        return start >= tomorrow
      }).length
    }
  }, [filteredEvents])

  // Check if event is in progress
  const isEventInProgress = useCallback((event: CalendarEvent): boolean => {
    const now = new Date()
    const start = new Date(event.startDate)
    const end = new Date(event.endDate)
    return start <= now && now <= end
  }, [])

  // Check if a date/time is blocked
  const isTimeBlocked = useCallback(
    (date: Date, hour?: number): boolean => {
      return blockedTimes.some((block) => {
        const blockStart = new Date(block.startDate)
        const blockEnd = new Date(block.endDate)

        if (block.type === BlockType.FULL_DAY) {
          return date >= blockStart && date <= blockEnd
        }

        if (block.type === BlockType.TIME_SLOT && hour !== undefined && block.startTime && block.endTime) {
          const [startHour] = block.startTime.split(':').map(Number)
          const [endHour] = block.endTime.split(':').map(Number)
          return date >= blockStart && date <= blockEnd && hour >= startHour && hour < endHour
        }

        if (block.type === BlockType.RANGE) {
          return date >= blockStart && date <= blockEnd
        }

        return false
      })
    },
    [blockedTimes]
  )

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const isToday = (date: Date, compareDate: Date) => {
    return (
      date.getDate() === compareDate.getDate() &&
      date.getMonth() === compareDate.getMonth() &&
      date.getFullYear() === compareDate.getFullYear()
    )
  }

  const getEventsForDate = (date: Date) => {
    return filteredEvents.filter((event) => {
      const eventStart = new Date(event.startDate)
      const eventEnd = new Date(event.endDate)
      const dayStart = new Date(date)
      dayStart.setHours(0, 0, 0, 0)
      const dayEnd = new Date(date)
      dayEnd.setHours(23, 59, 59, 999)

      return eventStart <= dayEnd && eventEnd >= dayStart
    })
  }

  const renderMonthView = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const days = []
    const today = new Date()

    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className='bg-muted/30 p-2 min-h-24'></div>)
    }

    // Days of month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      const dayEvents = getEventsForDate(date)
      const isCurrentDay = isToday(date, today)

      const isBlocked = isTimeBlocked(date)

      days.push(
        <div
          key={day}
          className={`min-h-24 p-2 border transition-all duration-200 ${
            isBlocked
              ? 'bg-red-50 dark:bg-red-950/20 border-red-300'
              : isCurrentDay
                ? 'bg-primary/10 border-primary shadow-sm'
                : 'bg-background border-border hover:shadow-md'
          } cursor-pointer hover:bg-accent/10`}
        >
          <p
            className={`text-sm font-semibold mb-2 ${
              isBlocked ? 'text-red-700 dark:text-red-300' : isCurrentDay ? 'text-primary' : 'text-foreground'
            }`}
          >
            {day}
            {isBlocked && <span className='text-xs ml-1'>🚫</span>}
          </p>
          <div className='space-y-1'>
            {dayEvents.slice(0, 2).map((event) => (
              <div
                key={event.id}
                className={`text-xs p-1 rounded text-white truncate cursor-pointer hover:opacity-80 transition-opacity ${getEventColorClass(
                  event.type
                )} ${isEventInProgress(event) ? 'ring-2 ring-emerald-500 animate-pulse' : ''}`}
                onClick={() => setSelectedEvent(event)}
                title={event.title}
              >
                {isEventInProgress(event) && <span className='text-emerald-300'>● </span>}
                {event.title}
              </div>
            ))}
            {dayEvents.length > 2 && <p className='text-xs text-muted-foreground font-medium'>+{dayEvents.length - 2} más</p>}
          </div>
        </div>
      )
    }

    return days
  }

  const renderWeekView = () => {
    const dayOfWeek = currentDate.getDay()
    const startOfWeek = new Date(currentDate)
    startOfWeek.setDate(currentDate.getDate() - dayOfWeek)

    const weekDays = []
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek)
      day.setDate(startOfWeek.getDate() + i)
      const dayEvents = getEventsForDate(day)

      weekDays.push(
        <div key={i} className='min-h-96 border p-3 space-y-2 hover:shadow-md transition-shadow'>
          <p className='font-semibold text-sm text-center'>
            {day.toLocaleDateString('es-ES', { weekday: 'short', month: 'short', day: 'numeric' })}
          </p>
          <div className='space-y-2'>
            {dayEvents.map((event) => (
              <div
                key={event.id}
                className={`text-xs p-2 rounded text-white cursor-pointer hover:opacity-80 transition-all ${getEventColorClass(
                  event.type
                )} ${isEventInProgress(event) ? 'ring-2 ring-emerald-500 shadow-md' : ''}`}
                onClick={() => setSelectedEvent(event)}
              >
                <p className='font-medium'>{event.title}</p>
                {!event.allDay && (
                  <p className='text-xs opacity-90 flex items-center gap-1'>
                    <Clock className='w-3 h-3' />
                    {new Date(event.startDate).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )
    }

    return weekDays
  }

  const renderDayView = () => {
    const dayEvents = getEventsForDate(currentDate)
    const sortedEvents = dayEvents.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())

    // Determine hours to display based on visible hours config or show all
    const startHourToShow = visibleHours?.startHour ?? 0
    const endHourToShow = visibleHours?.endHour ?? 24
    const hoursToDisplay = Array.from({ length: endHourToShow - startHourToShow }, (_, i) => startHourToShow + i)

    return (
      <div className='space-y-4'>
        {/* Show blocked status if applicable */}
        {isTimeBlocked(currentDate) && (
          <div className='p-3 bg-red-50 dark:bg-red-950/30 border border-red-300 rounded-lg flex items-center gap-2'>
            <span className='text-xl'>🚫</span>
            <div>
              <p className='font-semibold text-red-700 dark:text-red-300'>Este día está bloqueado</p>
              <p className='text-sm text-red-600 dark:text-red-400'>
                {blockedTimes
                  .filter((block) => {
                    const blockStart = new Date(block.startDate)
                    const blockEnd = new Date(block.endDate)
                    return currentDate >= blockStart && currentDate <= blockEnd
                  })
                  .map((block) => block.title)
                  .join(', ')}
              </p>
            </div>
          </div>
        )}

        {/* Timeline view */}
        <div className='space-y-2'>
          {hoursToDisplay.map((hour) => {
            const hourStart = new Date(currentDate)
            hourStart.setHours(hour, 0, 0, 0)
            const hourEnd = new Date(hourStart)
            hourEnd.setHours(hour + 1, 0, 0, 0)

            const hourEvents = sortedEvents.filter((event) => {
              const eventStart = new Date(event.startDate)
              const eventEnd = new Date(event.endDate)
              return (eventStart < hourEnd && eventEnd > hourStart) || event.allDay
            })

            const hourBlocked = isTimeBlocked(currentDate, hour)

            return (
              <div key={hour} className='flex gap-4'>
                <div className='w-16 text-sm font-semibold text-muted-foreground pt-2 sticky left-0 bg-background'>
                  {String(hour).padStart(2, '0')}:00
                </div>
                <div
                  className={`flex-1 min-h-16 p-2 border rounded-lg transition-colors ${
                    hourBlocked
                      ? 'bg-red-50 dark:bg-red-950/20 border-red-300 hover:bg-red-100 dark:hover:bg-red-950/30'
                      : 'bg-background hover:bg-accent/5'
                  }`}
                >
                  {hourBlocked && <p className='text-xs font-semibold text-red-700 dark:text-red-300 mb-1'>Bloqueado</p>}
                  {hourEvents.map((event) => (
                    <div
                      key={event.id}
                      className={`text-xs p-2 rounded mb-1 text-white cursor-pointer hover:opacity-80 transition-all ${getEventColorClass(
                        event.type
                      )} ${isEventInProgress(event) ? 'ring-2 ring-emerald-500 shadow-md animate-pulse' : ''}`}
                      onClick={() => setSelectedEvent(event)}
                    >
                      <p className='font-medium truncate'>{event.title}</p>
                      {!event.allDay && (
                        <p className='text-xs opacity-90'>
                          {new Date(event.startDate).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} -
                          {new Date(event.endDate).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* All day events */}
        {sortedEvents.filter((e) => e.allDay).length > 0 && (
          <div className='border-t pt-4'>
            <h4 className='text-sm font-semibold mb-2'>Eventos Todo el Día</h4>
            <div className='space-y-2'>
              {sortedEvents
                .filter((e) => e.allDay)
                .map((event) => (
                  <div
                    key={event.id}
                    className={`p-3 rounded-lg border text-sm cursor-pointer hover:shadow-md transition-all ${getEventBorderColorClass(
                      event.type
                    )} border-l-4`}
                    onClick={() => setSelectedEvent(event)}
                  >
                    <h4 className='font-semibold'>{event.title}</h4>
                    {event.description && <p className='text-muted-foreground mt-1'>{event.description}</p>}
                    {event.location && <p className='text-muted-foreground mt-1'>📍 {event.location}</p>}
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  const uniqueEventTypes = useMemo(() => {
    return Array.from(new Set(events.map((e) => e.type))).sort()
  }, [events])

  return (
    <div className='space-y-6'>
      {error && (
        <Alert variant='destructive' className='animate-in fade-in'>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className='border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/30 animate-in fade-in'>
          <AlertDescription className='text-emerald-700 dark:text-emerald-400'>{success}</AlertDescription>
        </Alert>
      )}

      <div className='space-y-4'>
        {/* Header */}
        <div className='pb-3'>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle className='text-2xl flex items-center gap-2'>
                <Calendar className='h-6 w-6' />
                {viewMode === 'month' && `${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`}
                {viewMode === 'week' &&
                  `Semana del ${currentDate.toLocaleDateString('es-ES', { month: 'long', day: 'numeric', year: 'numeric' })}`}
                {viewMode === 'day' &&
                  currentDate.toLocaleDateString('es-ES', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </CardTitle>
              <CardDescription>Gestiona tus eventos de calendario ({eventStats.total} eventos)</CardDescription>
            </div>
            <Button onClick={() => setShowFormModal(true)} disabled={isPending}>
              <Plus className='h-4 w-4 mr-2' />
              Nuevo Evento
            </Button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className='flex gap-3 flex-wrap items-center'>
          <div className='flex-1 min-w-64 relative'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground' />
            <Input
              placeholder='Buscar eventos por título, descripción o ubicación...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='pl-10'
            />
            {searchQuery && (
              <button
                type='button'
                onClick={() => setSearchQuery('')}
                className='absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground'
              >
                <X className='w-4 h-4' />
              </button>
            )}
          </div>

          <div className='flex gap-2 flex-wrap'>
            <Button
              variant={filterType === 'ALL' ? 'default' : 'outline'}
              size='sm'
              onClick={() => setFilterType('ALL')}
              className='flex items-center gap-2'
            >
              <Filter className='w-4 h-4' />
              Todos
            </Button>
            {uniqueEventTypes.map((type) => (
              <Button
                key={type}
                variant={filterType === type ? 'default' : 'outline'}
                size='sm'
                onClick={() => setFilterType(type)}
              >
                {type}
              </Button>
            ))}
          </div>
        </div>

        <div className='space-y-6'>
          {/* Controls */}
          <div className='flex items-center justify-between gap-4 flex-wrap'>
            <div className='flex gap-2'>
              <Button variant='outline' size='sm' onClick={handlePrevMonth} disabled={isPending} title='Anterior (← flecha)'>
                <ChevronLeft className='h-4 w-4' />
              </Button>
              <Button variant='outline' size='sm' onClick={handleToday} disabled={isPending} className='min-w-20'>
                Hoy
              </Button>
              <Button variant='outline' size='sm' onClick={handleNextMonth} disabled={isPending} title='Siguiente (→ flecha)'>
                <ChevronRight className='h-4 w-4' />
              </Button>
            </div>

            <div className='flex gap-2'>
              {(['month', 'week', 'day'] as const).map((mode) => (
                <Button
                  key={mode}
                  size='sm'
                  variant={viewMode === mode ? 'default' : 'outline'}
                  onClick={() => setViewMode(mode)}
                  disabled={isPending}
                >
                  {mode === 'month' ? 'Mes' : mode === 'week' ? 'Semana' : 'Día'}
                </Button>
              ))}
              <Button
                size='sm'
                variant={showConfigPanel ? 'default' : 'outline'}
                onClick={() => setShowConfigPanel(!showConfigPanel)}
                disabled={isPending}
                title='Configuración del calendario'
              >
                <Settings className='h-4 w-4' />
              </Button>
            </div>
          </div>

          {/* Configuration Panel - Display Only */}
          {showConfigPanel && (blockedTimes.length > 0 || visibleHours || config?.workingHours) && (
            <div className='border rounded-lg p-4 bg-secondary/30 space-y-4 animate-in fade-in'>
              <h3 className='text-lg font-semibold flex items-center gap-2'>
                <Settings className='h-5 w-5' />
                Configuración del Calendario
              </h3>

              {/* Blocked Times Section */}
              {blockedTimes.length > 0 && (
                <div className='space-y-3 border-t pt-4'>
                  <h4 className='font-semibold text-sm'>Tiempos Bloqueados</h4>
                  <div className='space-y-2 max-h-48 overflow-y-auto'>
                    {blockedTimes.map((block) => (
                      <div key={block.id} className='flex items-start gap-2 p-2 bg-background rounded-md border'>
                        <div className='flex-1 min-w-0'>
                          <p className='text-sm font-medium truncate'>{block.title}</p>
                          <p className='text-xs text-muted-foreground'>
                            {block.type === BlockType.FULL_DAY && 'Día completo'}
                            {block.type === BlockType.TIME_SLOT && 'Rango horario'}
                            {block.type === BlockType.RANGE && 'Rango de fechas'}
                            {block.type === BlockType.RECURRING && 'Recurrente'}
                          </p>
                          {block.description && <p className='text-xs text-muted-foreground mt-1'>{block.description}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Visible Hours Configuration */}
              {visibleHours && (
                <div className='space-y-3 border-t pt-4'>
                  <h4 className='font-semibold text-sm'>Horas Visibles en Vista de Día</h4>
                  <div className='text-sm bg-background p-2 rounded-md border'>
                    <p>
                      <span className='font-medium'>De:</span> {visibleHours.startHour}:00 a {visibleHours.endHour}:00
                    </p>
                  </div>
                </div>
              )}

              {/* Working Hours Info */}
              {config?.workingHours && (
                <div className='space-y-3 border-t pt-4'>
                  <h4 className='font-semibold text-sm'>Horarios de Trabajo Configurados</h4>
                  <p className='text-sm text-muted-foreground'>Los horarios de trabajo están configurados en tu perfil</p>
                </div>
              )}
            </div>
          )}

          {/* Calendar Views */}
          {viewMode === 'month' && (
            <div className='space-y-2'>
              {/* Day headers */}
              <div className='grid grid-cols-7 gap-0 border rounded-lg overflow-hidden'>
                {DAYS_OF_WEEK.map((day) => (
                  <div key={day} className='bg-secondary p-3 text-center font-semibold text-sm text-secondary-foreground'>
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar days */}
              <div className='grid grid-cols-7 gap-0 border rounded-lg overflow-hidden'>{renderMonthView()}</div>
            </div>
          )}

          {viewMode === 'week' && (
            <div className='grid grid-cols-7 gap-0 border rounded-lg overflow-hidden'>{renderWeekView()}</div>
          )}

          {viewMode === 'day' && <div className='border rounded-lg overflow-hidden bg-background p-4'>{renderDayView()}</div>}

          {/* Legend */}
          <div className='flex flex-wrap gap-4 p-4 bg-secondary/50 rounded-lg'>
            {(Object.keys(EVENT_LEGEND_COLORS) as Array<keyof typeof EVENT_LEGEND_COLORS>).map((type) => (
              <div key={type} className='flex items-center gap-2'>
                <div className={`w-3 h-3 rounded ${getEventLegendColorClass(type)}`}></div>
                <span className='text-sm font-medium'>{type}</span>
              </div>
            ))}
            <div className='flex items-center gap-2 border-l border-border pl-4'>
              <div className='w-3 h-3 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse'></div>
              <span className='text-sm font-medium'>En Progreso</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showFormModal && (
        <EventFormModal
          editingEvent={editingEvent}
          onClose={() => {
            setShowFormModal(false)
            setEditingEvent(null)
          }}
          onSuccess={() => {
            setShowFormModal(false)
            setEditingEvent(null)
            // Reload events
            startTransition(async () => {
              const result = await getEvents({
                type: 'month',
                year: currentDate.getFullYear(),
                month: currentDate.getMonth(),
                days: 0
              })
              if (result.success && result.data) {
                setEvents(result.data)
              }
            })
          }}
        />
      )}

      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onEdit={() => {
            setEditingEvent(selectedEvent)
            setShowFormModal(true)
            setSelectedEvent(null)
          }}
          onDelete={() => setDeleteConfirm(selectedEvent.id)}
        />
      )}

      {/* Delete Event Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Evento</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas eliminar este evento? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className='flex gap-3'>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirm && handleDeleteEvent(deleteConfirm)}
              disabled={isPending}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              {isPending && <Loader2 className='h-4 w-4 mr-2 animate-spin' />}
              Eliminar
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
