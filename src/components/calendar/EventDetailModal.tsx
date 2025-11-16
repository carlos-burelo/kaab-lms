'use client'

import { Clock, Edit2, MapPin, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

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

interface EventDetailModalProps {
  event: CalendarEvent
  onClose: () => void
  onEdit: () => void
  onDelete: () => void
}

const EVENT_TYPE_COLORS = {
  PERSONAL: 'bg-blue-100 text-blue-800',
  COURSE: 'bg-purple-100 text-purple-800',
  MEETING: 'bg-pink-100 text-pink-800',
  SUBMISSION: 'bg-amber-100 text-amber-800',
  EXAM: 'bg-red-100 text-red-800',
  OTHER: 'bg-gray-100 text-gray-800'
}

export function EventDetailModal({ event, onClose, onEdit, onDelete }: EventDetailModalProps) {
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (date: Date | string) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const startDate = new Date(event.startDate)
  const endDate = new Date(event.endDate)
  const isSameDay = formatDate(startDate) === formatDate(endDate)

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <div className='flex items-start justify-between gap-4'>
            <div className='flex-1'>
              <DialogTitle className='text-xl'>{event.title}</DialogTitle>
              <Badge className={(EVENT_TYPE_COLORS as any)[event.type] || 'bg-gray-100 text-gray-800'} variant='secondary'>
                {event.type}
              </Badge>
            </div>
            {event.color && <div className='w-6 h-6 rounded' style={{ backgroundColor: event.color }}></div>}
          </div>
        </DialogHeader>

        <div className='space-y-6 py-4'>
          {event.description && (
            <div>
              <p className='text-sm text-muted-foreground mb-2'>Description</p>
              <p className='text-sm'>{event.description}</p>
            </div>
          )}

          <div className='space-y-3'>
            <div className='flex items-center gap-3'>
              <Clock className='h-4 w-4 text-muted-foreground' />
              <div className='flex-1'>
                <p className='text-sm font-medium'>{event.allDay ? 'All day event' : 'Timed event'}</p>
                <p className='text-sm text-muted-foreground'>
                  {formatDate(startDate)}
                  {!event.allDay && ` at ${formatTime(startDate)}`}
                </p>
                {!isSameDay && (
                  <p className='text-sm text-muted-foreground'>
                    to {formatDate(endDate)}
                    {!event.allDay && ` at ${formatTime(endDate)}`}
                  </p>
                )}
              </div>
            </div>

            {event.location && (
              <div className='flex items-center gap-3'>
                <MapPin className='h-4 w-4 text-muted-foreground' />
                <div className='flex-1'>
                  <p className='text-sm font-medium'>Location</p>
                  <p className='text-sm text-muted-foreground'>{event.location}</p>
                </div>
              </div>
            )}
          </div>

          <div className='flex gap-3 pt-4 border-t'>
            <Button onClick={onEdit} variant='outline' className='flex-1'>
              <Edit2 className='h-4 w-4 mr-2' />
              Edit
            </Button>
            <Button onClick={onDelete} variant='destructive' className='flex-1'>
              <Trash2 className='h-4 w-4 mr-2' />
              Delete
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
