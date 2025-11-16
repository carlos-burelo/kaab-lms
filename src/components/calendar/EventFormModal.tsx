'use client'

import { AlertCircle, Loader2 } from 'lucide-react'
import { useState, useTransition } from 'react'
import type { DateRange } from 'react-day-picker'
import { createEvent, updateEvent } from '@/actions/calendar.actions'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RangeDatePicker } from '@/components/ui/range-date-picker'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

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
}

interface EventFormModalProps {
  editingEvent?: CalendarEvent | null
  onClose: () => void
  onSuccess: () => void
}

const EVENT_TYPES = [
  { value: 'PERSONAL', label: 'Personal' },
  { value: 'COURSE', label: 'Course' },
  { value: 'MEETING', label: 'Meeting' },
  { value: 'SUBMISSION', label: 'Submission' },
  { value: 'EXAM', label: 'Exam' },
  { value: 'OTHER', label: 'Other' }
]

const EVENT_COLORS = [
  { value: '#3b82f6', label: 'Blue' },
  { value: '#8b5cf6', label: 'Purple' },
  { value: '#ec4899', label: 'Pink' },
  { value: '#f59e0b', label: 'Amber' },
  { value: '#ef4444', label: 'Red' },
  { value: '#10b981', label: 'Green' },
  { value: '#06b6d4', label: 'Cyan' },
  { value: '#6b7280', label: 'Gray' }
]

export function EventFormModal({ editingEvent, onClose, onSuccess }: EventFormModalProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    editingEvent
      ? {
          from: new Date(editingEvent.startDate),
          to: new Date(editingEvent.endDate)
        }
      : undefined
  )

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const allDay = formData.get('allDay') === 'on'
    const location = formData.get('location') as string
    const color = formData.get('color') as string
    const type = formData.get('type') as string

    if (!title || !dateRange?.from || !dateRange?.to) {
      setError('El título y el rango de fechas son requeridos')
      return
    }

    startTransition(async () => {
      const result = editingEvent
        ? await updateEvent({
            eventId: editingEvent.id,
            title,
            description: description || undefined,
            startDate: dateRange.from!,
            endDate: dateRange.to!,
            allDay,
            location: location || undefined,
            color: color || undefined,
            type: (type as any) || 'PERSONAL'
          })
        : await createEvent({
            title,
            description: description || undefined,
            startDate: dateRange.from!,
            endDate: dateRange.to!,
            allDay,
            location: location || undefined,
            color: color || undefined,
            type: (type as any) || 'PERSONAL'
          })

      if (result.success) {
        onSuccess()
      } else {
        setError(result.error || 'Failed to save event')
      }
    })
  }

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle>{editingEvent ? 'Editar Evento' : 'Crear Nuevo Evento'}</DialogTitle>
          <DialogDescription>Agrega o actualiza los detalles del evento del calendario</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-6'>
          {error && (
            <Alert variant='destructive'>
              <AlertCircle className='h-4 w-4' />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className='space-y-2'>
            <Label htmlFor='title'>Título del Evento</Label>
            <Input
              id='title'
              name='title'
              placeholder='ej: Reunión de Equipo'
              defaultValue={editingEvent?.title}
              required
              disabled={isPending}
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='description'>Descripción</Label>
            <Textarea
              id='description'
              name='description'
              placeholder='Detalles del evento...'
              defaultValue={editingEvent?.description}
              disabled={isPending}
              rows={3}
            />
          </div>

          <div className='space-y-2'>
            <RangeDatePicker
              value={dateRange}
              onChange={setDateRange}
              label='Rango de Fechas'
              placeholder='Selecciona las fechas del evento'
              disabled={isPending}
            />
          </div>

          <div className='flex items-center gap-2'>
            <Checkbox id='allDay' name='allDay' defaultChecked={editingEvent?.allDay} disabled={isPending} />
            <Label htmlFor='allDay' className='cursor-pointer'>
              Evento de todo el día
            </Label>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='location'>Ubicación</Label>
            <Input
              id='location'
              name='location'
              placeholder='ej: Sala de Conferencias A'
              defaultValue={editingEvent?.location}
              disabled={isPending}
            />
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='type'>Tipo de Evento</Label>
              <Select name='type' defaultValue={editingEvent?.type || 'PERSONAL'} disabled={isPending}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='color'>Color del Evento</Label>
              <Select name='color' defaultValue={editingEvent?.color || '#3b82f6'} disabled={isPending}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_COLORS.map((color) => (
                    <SelectItem key={color.value} value={color.value}>
                      <div className='flex items-center gap-2'>
                        <div className='w-4 h-4 rounded' style={{ backgroundColor: color.value }}></div>
                        {color.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className='flex gap-3 justify-end pt-6'>
            <Button type='button' variant='outline' onClick={onClose} disabled={isPending}>
              Cancelar
            </Button>
            <Button type='submit' disabled={isPending}>
              {isPending && <Loader2 className='h-4 w-4 mr-2 animate-spin' />}
              {editingEvent ? 'Actualizar Evento' : 'Crear Evento'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
