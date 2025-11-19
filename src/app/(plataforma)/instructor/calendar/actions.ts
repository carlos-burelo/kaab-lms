'use server'

import { revalidatePath } from 'next/cache'
import { calendarRepository } from '@/database/repositories'
import { getSession } from '@/lib/auth'
import type { CalendarEventInput, CalendarListResponse, CalendarResponse } from '@/lib/calendar/calendar-types'

/**
 * Server actions para operaciones de calendario del instructor
 */

/**
 * Crear un nuevo evento
 */
export async function createCalendarEvent(data: CalendarEventInput): Promise<CalendarResponse<any>> {
  try {
    const session = await getSession()

    if (!session?.id) {
      return { success: false, error: 'No autenticado', timestamp: new Date() }
    }

    const event = await calendarRepository.createEvent(session.id, {
      title: data.title,
      description: data.description,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      allDay: data.allDay ?? false,
      location: data.location,
      color: data.color,
      type: data.type as any,
      reminders: data.reminders,
      metadata: {
        tags: data.tags,
        attendees: data.attendees,
        priority: data.priority,
        status: data.status
      }
    })

    revalidatePath('/instructor/calendar')

    return {
      success: true,
      data: event,
      timestamp: new Date()
    }
  } catch (_error) {
    console.error('[createCalendarEvent]', _error)
    return {
      success: false,
      error: _error instanceof Error ? _error.message : 'Error al crear evento',
      timestamp: new Date()
    }
  }
}

/**
 * Obtener evento por ID
 */
export async function getCalendarEvent(eventId: string): Promise<CalendarResponse<any>> {
  try {
    const session = await getSession()

    if (!session?.id) {
      return { success: false, error: 'No autenticado', timestamp: new Date() }
    }

    const event = await calendarRepository.getEventById(eventId, session.id)

    return {
      success: true,
      data: event,
      timestamp: new Date()
    }
  } catch (_error) {
    console.error('[getCalendarEvent]', _error)
    return {
      success: false,
      error: 'Error al obtener evento',
      timestamp: new Date()
    }
  }
}

/**
 * Actualizar evento
 */
export async function updateCalendarEvent(eventId: string, data: Partial<CalendarEventInput>): Promise<CalendarResponse<any>> {
  try {
    const session = await getSession()

    if (!session?.id) {
      return { success: false, error: 'No autenticado', timestamp: new Date() }
    }

    const updateData: any = {
      title: data.title,
      description: data.description,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : undefined,
      allDay: data.allDay,
      location: data.location,
      color: data.color,
      type: data.type,
      reminders: data.reminders
    }

    // Remove undefined values
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === undefined) {
        delete updateData[key]
      }
    })

    const event = await calendarRepository.updateEvent(eventId, updateData)

    revalidatePath('/instructor/calendar')

    return {
      success: true,
      data: event,
      timestamp: new Date()
    }
  } catch (_error) {
    console.error('[updateCalendarEvent]', _error)
    return {
      success: false,
      error: 'Error al actualizar evento',
      timestamp: new Date()
    }
  }
}

/**
 * Eliminar evento
 */
export async function deleteCalendarEvent(eventId: string): Promise<CalendarResponse<void>> {
  try {
    const session = await getSession()

    if (!session?.id) {
      return { success: false, error: 'No autenticado', timestamp: new Date() }
    }

    await calendarRepository.deleteEvent(eventId)

    revalidatePath('/instructor/calendar')

    return {
      success: true,
      timestamp: new Date()
    }
  } catch (_error) {
    console.error('[deleteCalendarEvent]', _error)
    return {
      success: false,
      error: 'Error al eliminar evento',
      timestamp: new Date()
    }
  }
}

/**
 * Obtener eventos del usuario para un rango de fechas
 */
export async function getCalendarEvents(fromDate: Date | string, toDate: Date | string): Promise<CalendarListResponse<any>> {
  try {
    const session = await getSession()

    if (!session?.id) {
      return {
        success: false,
        data: [],
        total: 0,
        offset: 0,
        limit: 0,
        timestamp: new Date()
      }
    }

    const events = await calendarRepository.getUserEvents(session.id, {
      fromDate: new Date(fromDate),
      toDate: new Date(toDate)
    })

    return {
      success: true,
      data: events || [],
      total: events?.length ?? 0,
      offset: 0,
      limit: 0,
      timestamp: new Date()
    }
  } catch (_error) {
    console.error('[getCalendarEvents]', _error)
    return {
      success: false,
      data: [],
      total: 0,
      offset: 0,
      limit: 0,
      timestamp: new Date()
    }
  }
}

/**
 * Obtener eventos de este mes
 */
export async function getMonthCalendarEvents(year: number, month: number): Promise<CalendarListResponse<any>> {
  try {
    const session = await getSession()

    if (!session?.id) {
      return {
        success: false,
        data: [],
        total: 0,
        offset: 0,
        limit: 0,
        timestamp: new Date()
      }
    }

    const events = await calendarRepository.getMonthEvents(session.id, year, month)

    return {
      success: true,
      data: events || [],
      total: events?.length ?? 0,
      offset: 0,
      limit: 0,
      timestamp: new Date()
    }
  } catch (_error) {
    console.error('[getMonthCalendarEvents]', _error)
    return {
      success: false,
      data: [],
      total: 0,
      offset: 0,
      limit: 0,
      timestamp: new Date()
    }
  }
}

/**
 * Buscar eventos
 */
export async function searchCalendarEvents(query: string): Promise<CalendarListResponse<any>> {
  try {
    const session = await getSession()

    if (!session?.id) {
      return {
        success: false,
        data: [],
        total: 0,
        offset: 0,
        limit: 0,
        timestamp: new Date()
      }
    }

    const events = await calendarRepository.getUserEvents(session.id, {
      search: query
    })

    return {
      success: true,
      data: events || [],
      total: events?.length ?? 0,
      offset: 0,
      limit: 0,
      timestamp: new Date()
    }
  } catch (_error) {
    console.error('[searchCalendarEvents]', _error)
    return {
      success: false,
      data: [],
      total: 0,
      offset: 0,
      limit: 0,
      timestamp: new Date()
    }
  }
}

/**
 * Filtrar eventos por tipo
 */
export async function filterCalendarEventsByType(type: string): Promise<CalendarListResponse<any>> {
  try {
    const session = await getSession()

    if (!session?.id) {
      return {
        success: false,
        data: [],
        total: 0,
        offset: 0,
        limit: 0,
        timestamp: new Date()
      }
    }

    const events = await calendarRepository.getUserEvents(session.id, {
      type
    })

    return {
      success: true,
      data: events || [],
      total: events?.length ?? 0,
      offset: 0,
      limit: 0,
      timestamp: new Date()
    }
  } catch (_error) {
    console.error('[filterCalendarEventsByType]', _error)
    return {
      success: false,
      data: [],
      total: 0,
      offset: 0,
      limit: 0,
      timestamp: new Date()
    }
  }
}

/**
 * Obtener eventos próximos (próximos 7 días)
 */
export async function getUpcomingCalendarEvents(): Promise<CalendarListResponse<any>> {
  try {
    const session = await getSession()

    if (!session?.id) {
      return {
        success: false,
        data: [],
        total: 0,
        offset: 0,
        limit: 0,
        timestamp: new Date()
      }
    }

    const now = new Date()
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

    const events = await calendarRepository.getUserEvents(session.id, {
      fromDate: now,
      toDate: nextWeek
    })

    return {
      success: true,
      data: events || [],
      total: events?.length ?? 0,
      offset: 0,
      limit: 0,
      timestamp: new Date()
    }
  } catch (_error) {
    console.error('[getUpcomingCalendarEvents]', _error)
    return {
      success: false,
      data: [],
      total: 0,
      offset: 0,
      limit: 0,
      timestamp: new Date()
    }
  }
}

/**
 * Agregar recordatorio a evento
 */
export async function addCalendarReminder(eventId: string, type: string): Promise<CalendarResponse<any>> {
  try {
    const session = await getSession()

    if (!session?.id) {
      return { success: false, error: 'No autenticado', timestamp: new Date() }
    }

    const event = await calendarRepository.getEventById(eventId, session.id)

    if (!event) {
      return { success: false, error: 'Evento no encontrado', timestamp: new Date() }
    }

    // Update event with new reminder
    const reminders = (Array.isArray(event.reminders) ? event.reminders : []) as any[]
    reminders.push({ type, enabled: true })

    const updated = await calendarRepository.updateEvent(eventId, {
      reminders
    })

    revalidatePath('/instructor/calendar')

    return {
      success: true,
      data: updated,
      timestamp: new Date()
    }
  } catch (_error) {
    console.error('[addCalendarReminder]', _error)
    return {
      success: false,
      error: 'Error al agregar recordatorio',
      timestamp: new Date()
    }
  }
}
