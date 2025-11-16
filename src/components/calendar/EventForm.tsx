'use client'

import { AlertCircle, Bell, Clock, MapPin, RotateCw, Tag, Users } from 'lucide-react'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import {
  type CalendarEventInput,
  EventPriority,
  EventStatus,
  EventType,
  type RecurrenceConfig,
  RecurrenceType,
  ReminderType
} from '@/lib/calendar/calendar-types'
import { createTimeOnDate, formatTime } from '@/lib/calendar/date-utils'

interface EventFormProps {
  event?: CalendarEventInput
  startDate?: Date
  endDate?: Date
  onSubmit: (data: CalendarEventInput) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
}

/**
 * Formulario avanzado para crear/editar eventos
 */
export function EventForm({ event, startDate, endDate, onSubmit, onCancel, isLoading = false }: EventFormProps) {
  const [formData, setFormData] = useState<CalendarEventInput>(
    event || {
      title: '',
      description: '',
      startDate: startDate || new Date(),
      endDate: endDate || new Date(),
      allDay: false,
      type: EventType.PERSONAL,
      status: EventStatus.SCHEDULED,
      priority: EventPriority.MEDIUM,
      reminders: [],
      tags: [],
      attendees: []
    }
  )

  const [recurrence, setRecurrence] = useState<RecurrenceConfig | null>(event?.recurrence || null)
  const [newTag, setNewTag] = useState('')
  const [newAttendee, setNewAttendee] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (!formData.title.trim()) {
        setError('El título es requerido')
        return
      }

      if (new Date(formData.startDate) > new Date(formData.endDate)) {
        setError('La fecha de inicio debe ser anterior a la fecha de fin')
        return
      }

      const data = {
        ...formData,
        recurrence: recurrence || undefined
      }

      await onSubmit(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar el evento')
    }
  }

  const addTag = () => {
    if (newTag.trim()) {
      setFormData((prev) => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const removeTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: (prev.tags || []).filter((t) => t !== tag)
    }))
  }

  const addAttendee = () => {
    if (newAttendee.trim()) {
      setFormData((prev) => ({
        ...prev,
        attendees: [...(prev.attendees || []), { email: newAttendee.trim(), status: 'PENDING' as const }]
      }))
      setNewAttendee('')
    }
  }

  const removeAttendee = (email: string) => {
    setFormData((prev) => ({
      ...prev,
      attendees: (prev.attendees || []).filter((a) => a.email !== email)
    }))
  }

  const addReminder = (type: ReminderType) => {
    setFormData((prev) => ({
      ...prev,
      reminders: [...(prev.reminders || []), { type, enabled: true }]
    }))
  }

  const removeReminder = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      reminders: (prev.reminders || []).filter((_, i) => i !== idx)
    }))
  }

  return (
    <div className='w-full max-w-2xl'>
      <form onSubmit={handleSubmit} className='space-y-6'>
        {error && (
          <Card className='p-3 bg-red-50 border-red-200'>
            <div className='flex gap-2 text-red-800'>
              <AlertCircle className='w-5 h-5 flex-shrink-0' />
              <p className='text-sm'>{error}</p>
            </div>
          </Card>
        )}

        <Tabs defaultValue='basic' className='w-full'>
          <TabsList className='grid w-full grid-cols-4'>
            <TabsTrigger value='basic'>Básico</TabsTrigger>
            <TabsTrigger value='details'>Detalles</TabsTrigger>
            <TabsTrigger value='recurrence'>Recurrencia</TabsTrigger>
            <TabsTrigger value='advanced'>Avanzado</TabsTrigger>
          </TabsList>

          {/* BASIC TAB */}
          <TabsContent value='basic' className='space-y-4'>
            {/* Title */}
            <div>
              <div className='block text-sm font-medium mb-2'>Título *</div>
              <Input
                type='text'
                placeholder='Título del evento'
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                maxLength={100}
              />
            </div>

            {/* Description */}
            <div>
              <div className='block text-sm font-medium mb-2'>Descripción</div>
              <Textarea
                placeholder='Descripción del evento'
                value={formData.description || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>

            {/* Event Type */}
            <div>
              <div className='block text-sm font-medium mb-2'>Tipo de evento</div>
              <Select
                value={formData.type || EventType.PERSONAL}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, type: value as EventType }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(EventType).map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Color */}
            <div>
              <div className='block text-sm font-medium mb-2'>Color</div>
              <div className='flex gap-2'>
                {['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#ef4444', '#10b981', '#06b6d4', '#6b7280'].map((color) => (
                  <button
                    key={color}
                    type='button'
                    className='w-8 h-8 rounded-full border-2 transition-all'
                    style={{
                      backgroundColor: color,
                      borderColor: formData.color === color ? '#000' : 'transparent'
                    }}
                    onClick={() => setFormData((prev) => ({ ...prev, color }))}
                  />
                ))}
              </div>
            </div>
          </TabsContent>

          {/* DETAILS TAB */}
          <TabsContent value='details' className='space-y-4'>
            {/* All day toggle */}
            <div className='flex items-center gap-2'>
              <input
                type='checkbox'
                id='allday'
                checked={formData.allDay}
                onChange={(e) => setFormData((prev) => ({ ...prev, allDay: e.target.checked }))}
                className='w-4 h-4'
              />
              <label htmlFor='allday' className='text-sm font-medium cursor-pointer'>
                Todo el día
              </label>
            </div>

            {/* Start Date */}
            <div>
              <div className='block text-sm font-medium mb-2 flex items-center gap-2'>
                <Clock className='w-4 h-4' /> Fecha y hora de inicio
              </div>
              <div className='flex gap-2'>
                <Input
                  type='date'
                  value={new Date(formData.startDate).toISOString().split('T')[0]}
                  onChange={(e) => {
                    const date = new Date(e.target.value)
                    setFormData((prev) => ({ ...prev, startDate: date }))
                  }}
                />
                {!formData.allDay && (
                  <Input
                    type='time'
                    value={formatTime(new Date(formData.startDate))}
                    onChange={(e) => {
                      const startDate = new Date(formData.startDate)
                      const newDate = createTimeOnDate(startDate, e.target.value)
                      setFormData((prev) => ({ ...prev, startDate: newDate }))
                    }}
                  />
                )}
              </div>
            </div>

            {/* End Date */}
            <div>
              <div className='block text-sm font-medium mb-2 flex items-center gap-2'>
                <Clock className='w-4 h-4' /> Fecha y hora de fin
              </div>
              <div className='flex gap-2'>
                <Input
                  type='date'
                  value={new Date(formData.endDate).toISOString().split('T')[0]}
                  onChange={(e) => {
                    const date = new Date(e.target.value)
                    setFormData((prev) => ({ ...prev, endDate: date }))
                  }}
                />
                {!formData.allDay && (
                  <Input
                    type='time'
                    value={formatTime(new Date(formData.endDate))}
                    onChange={(e) => {
                      const endDate = new Date(formData.endDate)
                      const newDate = createTimeOnDate(endDate, e.target.value)
                      setFormData((prev) => ({ ...prev, endDate: newDate }))
                    }}
                  />
                )}
              </div>
            </div>

            {/* Location */}
            <div>
              <div className='block text-sm font-medium mb-2 flex items-center gap-2'>
                <MapPin className='w-4 h-4' /> Ubicación
              </div>
              <Input
                type='text'
                placeholder='Ubicación del evento'
                value={formData.location || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
              />
            </div>

            {/* Status & Priority */}
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <div className='block text-sm font-medium mb-2'>Estado</div>
                <Select
                  value={formData.status || EventStatus.SCHEDULED}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value as EventStatus }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(EventStatus).map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <div className='block text-sm font-medium mb-2'>Prioridad</div>
                <Select
                  value={formData.priority || EventPriority.MEDIUM}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, priority: value as EventPriority }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(EventPriority).map((priority) => (
                      <SelectItem key={priority} value={priority}>
                        {priority}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          {/* RECURRENCE TAB */}
          <TabsContent value='recurrence' className='space-y-4'>
            <div>
              <div className='block text-sm font-medium mb-2 flex items-center gap-2'>
                <RotateCw className='w-4 h-4' /> Tipo de recurrencia
              </div>
              <Select
                value={recurrence?.type || RecurrenceType.NONE}
                onValueChange={(value) => {
                  if (value === RecurrenceType.NONE) {
                    setRecurrence(null)
                  } else {
                    setRecurrence({ type: value as RecurrenceType })
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(RecurrenceType).map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {recurrence && recurrence.type !== RecurrenceType.NONE && (
              <>
                <div>
                  <div className='block text-sm font-medium mb-2'>Fin de la recurrencia</div>
                  <Input
                    type='date'
                    value={recurrence.endDate ? new Date(recurrence.endDate).toISOString().split('T')[0] : ''}
                    onChange={(e) =>
                      setRecurrence((prev) => ({
                        ...prev!,
                        endDate: e.target.value ? new Date(e.target.value) : undefined
                      }))
                    }
                  />
                </div>

                <div>
                  <div className='block text-sm font-medium mb-2'>Número de ocurrencias</div>
                  <Input
                    type='number'
                    min={1}
                    value={recurrence.occurrences || ''}
                    onChange={(e) =>
                      setRecurrence((prev) => ({
                        ...prev!,
                        occurrences: e.target.value ? parseInt(e.target.value, 10) : undefined
                      }))
                    }
                  />
                </div>
              </>
            )}
          </TabsContent>

          {/* ADVANCED TAB */}
          <TabsContent value='advanced' className='space-y-4'>
            {/* Reminders */}
            <div>
              <div className='block text-sm font-medium mb-2 flex items-center gap-2'>
                <Bell className='w-4 h-4' /> Recordatorios
              </div>
              <div className='space-y-2'>
                {formData.reminders?.map((reminder, idx) => (
                  <div key={idx} className='flex items-center justify-between p-2 bg-gray-50 rounded'>
                    <span className='text-sm'>{reminder.type}</span>
                    <Button type='button' variant='ghost' size='sm' onClick={() => removeReminder(idx)}>
                      ✕
                    </Button>
                  </div>
                ))}
              </div>

              <div className='flex gap-2 mt-2'>
                <Select onValueChange={(type) => addReminder(type as ReminderType)}>
                  <SelectTrigger className='flex-1'>
                    <SelectValue placeholder='Agregar recordatorio' />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(ReminderType).map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Tags */}
            <div>
              <div className='block text-sm font-medium mb-2 flex items-center gap-2'>
                <Tag className='w-4 h-4' /> Etiquetas
              </div>
              <div className='flex flex-wrap gap-2 mb-2'>
                {formData.tags?.map((tag) => (
                  <Badge key={tag} variant='secondary' className='cursor-pointer' onClick={() => removeTag(tag)}>
                    {tag} ✕
                  </Badge>
                ))}
              </div>

              <div className='flex gap-2'>
                <Input
                  type='text'
                  placeholder='Nueva etiqueta'
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button type='button' variant='outline' onClick={addTag}>
                  Agregar
                </Button>
              </div>
            </div>

            {/* Attendees */}
            <div>
              <div className='block text-sm font-medium mb-2 flex items-center gap-2'>
                <Users className='w-4 h-4' /> Asistentes
              </div>
              <div className='space-y-2'>
                {formData.attendees?.map((attendee) => (
                  <div key={attendee.email} className='flex items-center justify-between p-2 bg-gray-50 rounded'>
                    <div>
                      <p className='text-sm font-medium'>{attendee.email}</p>
                      <p className='text-xs text-gray-500'>{attendee.status}</p>
                    </div>
                    <Button type='button' variant='ghost' size='sm' onClick={() => removeAttendee(attendee.email)}>
                      ✕
                    </Button>
                  </div>
                ))}
              </div>

              <div className='flex gap-2 mt-2'>
                <Input
                  type='email'
                  placeholder='Email del asistente'
                  value={newAttendee}
                  onChange={(e) => setNewAttendee(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAttendee())}
                />
                <Button type='button' variant='outline' onClick={addAttendee}>
                  Agregar
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Form Actions */}
        <div className='flex justify-end gap-2 pt-4 border-t'>
          <Button type='button' variant='outline' onClick={onCancel} disabled={isLoading}>
            Cancelar
          </Button>
          <Button type='submit' disabled={isLoading}>
            {isLoading ? 'Guardando...' : 'Guardar Evento'}
          </Button>
        </div>
      </form>
    </div>
  )
}
