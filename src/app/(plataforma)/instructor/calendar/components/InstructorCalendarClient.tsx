'use client'

import { Plus, Search } from 'lucide-react'
import { useCallback, useState } from 'react'
import { CalendarGrid } from '@/components/calendar/CalendarGrid'
import { EventForm } from '@/components/calendar/EventForm'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCalendar } from '@/hooks/useCalendar'
import { type CalendarEventBase, CalendarView, EventType } from '@/lib/calendar/calendar-types'

interface InstructorCalendarClientProps {
  initialEvents: CalendarEventBase[]
  userId: string
}

/**
 * Componente cliente del calendario para instructores
 * Integra el nuevo módulo de calendario con UI avanzada
 */
export function InstructorCalendarClient({ userId }: InstructorCalendarClientProps) {
  const {
    events,
    isLoading,
    error,
    currentView,
    currentDate,
    createEvent,
    updateEvent,
    deleteEvent,
    nextPeriod,
    previousPeriod,
    goToToday,
    setView,
    searchEvents,
    getEventsForType
  } = useCalendar(userId, CalendarView.MONTH)

  const [showFormModal, setShowFormModal] = useState(false)
  const [showEventDetails, setShowEventDetails] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEventBase | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<EventType | 'ALL'>('ALL')
  const [isSubmitting, setIsSubmitting] = useState(false)

  /**
   * Manejar creación de evento
   */
  const handleCreateEvent = useCallback(
    async (data: any) => {
      setIsSubmitting(true)
      try {
        await createEvent(data)
        setShowFormModal(false)
      } catch (err) {
        console.error('Error creating event:', err)
      } finally {
        setIsSubmitting(false)
      }
    },
    [createEvent]
  )

  /**
   * Manejar actualización de evento
   */
  const handleUpdateEvent = useCallback(
    async (data: any) => {
      if (!selectedEvent) return

      setIsSubmitting(true)
      try {
        await updateEvent(selectedEvent.id, data)
        setShowEventDetails(false)
        setSelectedEvent(null)
      } catch (err) {
        console.error('Error updating event:', err)
      } finally {
        setIsSubmitting(false)
      }
    },
    [selectedEvent, updateEvent]
  )

  /**
   * Manejar eliminación de evento
   */
  const handleDeleteEvent = useCallback(
    async (eventId: string) => {
      if (!confirm('¿Estás seguro de que deseas eliminar este evento?')) return

      setIsSubmitting(true)
      try {
        await deleteEvent(eventId)
        setShowEventDetails(false)
        setSelectedEvent(null)
      } catch (err) {
        console.error('Error deleting event:', err)
      } finally {
        setIsSubmitting(false)
      }
    },
    [deleteEvent]
  )

  /**
   * Manejar búsqueda
   */
  const handleSearch = useCallback(
    async (query: string) => {
      setSearchQuery(query)
      if (query.trim()) {
        await searchEvents(query)
      }
    },
    [searchEvents]
  )

  /**
   * Manejar filtro por tipo
   */
  const handleFilterByType = useCallback((type: EventType | 'ALL') => {
    setFilterType(type)
  }, [])

  /**
   * Abrir formulario para crear evento
   */
  const handleOpenCreateForm = useCallback(() => {
    setSelectedEvent(null)
    setShowFormModal(true)
  }, [])

  /**
   * Abrir detalles del evento
   */
  const handleSelectEvent = useCallback((event: CalendarEventBase) => {
    setSelectedEvent(event)
    setShowEventDetails(true)
  }, [])

  // Filtrar eventos por tipo si está seleccionado
  const displayEvents = filterType === 'ALL' ? (searchQuery ? events : events) : getEventsForType(filterType)

  const eventTypeOptions = [
    { value: 'ALL', label: 'Todos los tipos' },
    { value: EventType.PERSONAL, label: 'Personal' },
    { value: EventType.COURSE, label: 'Curso' },
    { value: EventType.MEETING, label: 'Reunión' },
    { value: EventType.SUBMISSION, label: 'Entrega' },
    { value: EventType.EXAM, label: 'Examen' },
    { value: EventType.DEADLINE, label: 'Plazo' }
  ]

  return (
    <div className='space-y-6'>
      {/* Toolbar */}
      <div className='flex flex-col gap-4'>
        {/* Top controls */}
        <div className='flex items-center justify-between gap-4'>
          {/* View selector */}
          <div className='flex gap-2'>
            {[
              { view: CalendarView.DAY, icon: '📅', label: 'Día' },
              { view: CalendarView.WEEK, icon: '📆', label: 'Semana' },
              { view: CalendarView.MONTH, icon: '📋', label: 'Mes' },
              { view: CalendarView.AGENDA, icon: '📝', label: 'Agenda' }
            ].map(({ view, icon, label }) => (
              <Button
                key={view}
                variant={currentView === view ? 'default' : 'outline'}
                size='sm'
                onClick={() => setView(view)}
                title={label}
              >
                {icon}
              </Button>
            ))}
          </div>

          {/* Navigation */}
          <div className='flex gap-2'>
            <Button variant='outline' size='sm' onClick={previousPeriod}>
              ← Anterior
            </Button>
            <Button variant='outline' size='sm' onClick={goToToday}>
              Hoy
            </Button>
            <Button variant='outline' size='sm' onClick={nextPeriod}>
              Siguiente →
            </Button>
          </div>

          {/* Create button */}
          <Button onClick={handleOpenCreateForm} className='gap-2'>
            <Plus className='w-4 h-4' />
            Nuevo Evento
          </Button>
        </div>

        {/* Search and filters */}
        <div className='flex gap-4 flex-wrap'>
          {/* Search */}
          <div className='flex-1 min-w-64'>
            <div className='relative'>
              <Search className='absolute left-3 top-3 w-4 h-4 text-gray-400' />
              <Input
                placeholder='Buscar eventos...'
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className='pl-10'
              />
            </div>
          </div>

          {/* Type filter */}
          <Select value={filterType} onValueChange={handleFilterByType}>
            <SelectTrigger className='w-48'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {eventTypeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <Card className='p-4 bg-red-50 border-red-200 text-red-800'>
          <p className='text-sm'>{error}</p>
        </Card>
      )}

      {/* Calendar Grid */}
      <div className='border rounded-lg bg-white'>
        {isLoading ? (
          <div className='p-8 text-center text-gray-500'>Cargando eventos...</div>
        ) : (
          <CalendarGrid
            date={currentDate}
            events={displayEvents}
            view={currentView}
            onSelectDate={() => {}}
            onSelectEvent={handleSelectEvent}
            onNextPeriod={nextPeriod}
            onPreviousPeriod={previousPeriod}
            highlightToday={true}
          />
        )}
      </div>

      {/* Event count */}
      <Card className='p-4 bg-gray-50'>
        <div className='flex items-center justify-between'>
          <div className='text-sm text-gray-600'>
            <strong>{displayEvents.length}</strong> eventos mostrados
            {searchQuery && ` (búsqueda: "${searchQuery}")`}
            {filterType !== 'ALL' && ` (tipo: ${filterType})`}
          </div>
          <div className='flex gap-2'>
            {Array.from(new Set(events.map((e) => e.type))).map((type) => {
              const count = events.filter((e) => e.type === type).length
              return (
                <Badge key={type} variant='outline'>
                  {type}: {count}
                </Badge>
              )
            })}
          </div>
        </div>
      </Card>

      {/* Create/Edit Event Modal */}
      <Dialog open={showFormModal} onOpenChange={setShowFormModal}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>Crear Nuevo Evento</DialogTitle>
            <DialogDescription>Completa los detalles para crear un nuevo evento en tu calendario</DialogDescription>
          </DialogHeader>

          <EventForm
            startDate={currentDate}
            onSubmit={handleCreateEvent}
            onCancel={() => setShowFormModal(false)}
            isLoading={isSubmitting}
          />
        </DialogContent>
      </Dialog>

      {/* Event Details Modal */}
      {selectedEvent && (
        <Dialog open={showEventDetails} onOpenChange={setShowEventDetails}>
          <DialogContent className='max-w-2xl'>
            <DialogHeader>
              <DialogTitle>Editar Evento</DialogTitle>
              <DialogDescription>Actualiza los detalles de tu evento</DialogDescription>
            </DialogHeader>

            <EventForm
              event={{
                title: selectedEvent.title,
                description: selectedEvent.description,
                startDate: selectedEvent.startDate,
                endDate: selectedEvent.endDate,
                allDay: selectedEvent.allDay,
                location: selectedEvent.location,
                color: selectedEvent.color,
                type: selectedEvent.type,
                status: selectedEvent.status,
                priority: selectedEvent.priority,
                reminders: selectedEvent.reminders,
                tags: selectedEvent.tags,
                attendees: selectedEvent.attendees
              }}
              onSubmit={handleUpdateEvent}
              onCancel={() => {
                setShowEventDetails(false)
                setSelectedEvent(null)
              }}
              isLoading={isSubmitting}
            />

            {/* Delete button */}
            <div className='pt-4 border-t'>
              <Button
                variant='destructive'
                onClick={() => handleDeleteEvent(selectedEvent.id)}
                disabled={isSubmitting}
                className='w-full'
              >
                Eliminar Evento
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
