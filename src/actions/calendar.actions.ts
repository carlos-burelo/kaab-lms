'use server'

import { revalidatePath } from 'next/cache'
import z from 'zod'
import { calendarRepository } from '@/database/repositories'
import { getSession } from '@/lib/auth'

/**
 * Calendar Actions
 * Server actions para operaciones de calendario
 */

// ============================================================================
// SCHEMAS - VALIDACIÓN
// ============================================================================

const CreateEventSchema = z.object({
  title: z.string().min(1, 'Title is required').min(3, 'Minimum 3 characters'),
  description: z.string().optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  allDay: z.boolean().default(false),
  location: z.string().optional(),
  color: z.string().optional(),
  reminders: z.any().optional(),
  type: z.enum(['PERSONAL', 'COURSE', 'MEETING', 'SUBMISSION', 'EXAM', 'OTHER']).default('PERSONAL'),
  metadata: z.any().optional()
})

const UpdateEventSchema = CreateEventSchema.extend({
  eventId: z.string().min(1, 'Event ID is required')
})

const GetEventsSchema = z.object({
  year: z.number().optional(),
  month: z.number().optional(),
  type: z.enum(['month', 'week', 'day', 'upcoming']).default('month'),
  days: z.number().optional().default(7),
  date: z.coerce.date().optional()
})

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

type ActionResponse<T = any> = {
  success: boolean
  data?: T
  error?: string
}

// ============================================================================
// EVENT OPERATIONS
// ============================================================================

/**
 * Create a new calendar event
 */
export async function createEvent(params: z.infer<typeof CreateEventSchema>): Promise<ActionResponse> {
  try {
    const session = await getSession()
    if (!session?.id) {
      return {
        success: false,
        error: 'User not authenticated'
      }
    }

    const parsed = CreateEventSchema.safeParse(params)
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || 'Validation error'
      }
    }

    // Validate dates
    if (parsed.data.startDate >= parsed.data.endDate) {
      return {
        success: false,
        error: 'Start date must be before end date'
      }
    }

    const event = await calendarRepository.createEvent(session.id, parsed.data)

    revalidatePath('/instructor/calendar')

    return {
      success: true,
      data: event
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error creating event'
    }
  }
}

/**
 * Get events
 */
export async function getEvents(params: z.infer<typeof GetEventsSchema>): Promise<ActionResponse> {
  try {
    const session = await getSession()
    if (!session?.id) {
      return {
        success: false,
        error: 'User not authenticated'
      }
    }

    const parsed = GetEventsSchema.safeParse(params)
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || 'Validation error'
      }
    }

    let events: any[] = []

    switch (parsed.data.type) {
      case 'month':
        if (!parsed.data.year || parsed.data.month === undefined) {
          return { success: false, error: 'Year and month required for month view' }
        }
        events = await calendarRepository.getMonthEvents(session.id, parsed.data.year, parsed.data.month)
        break

      case 'week': {
        const weekDate = parsed.data.date || new Date()
        events = await calendarRepository.getWeekEvents(session.id, weekDate)
        break
      }

      case 'day': {
        const dayDate = parsed.data.date || new Date()
        events = await calendarRepository.getDayEvents(session.id, dayDate)
        break
      }

      case 'upcoming':
        events = await calendarRepository.getUpcomingEvents(session.id, parsed.data.days)
        break

      default:
        events = []
    }

    return {
      success: true,
      data: events
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error getting events'
    }
  }
}

/**
 * Get event by ID
 */
export async function getEventById(eventId: string): Promise<ActionResponse> {
  try {
    const session = await getSession()
    if (!session?.id) {
      return {
        success: false,
        error: 'User not authenticated'
      }
    }

    const event = await calendarRepository.getEventById(eventId, session.id)
    if (!event) {
      return {
        success: false,
        error: 'Event not found'
      }
    }

    return {
      success: true,
      data: event
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error getting event'
    }
  }
}

/**
 * Update event
 */
export async function updateEvent(params: z.infer<typeof UpdateEventSchema>): Promise<ActionResponse> {
  try {
    const session = await getSession()
    if (!session?.id) {
      return {
        success: false,
        error: 'User not authenticated'
      }
    }

    const parsed = UpdateEventSchema.safeParse(params)
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || 'Validation error'
      }
    }

    // Validate dates
    if (parsed.data.startDate >= parsed.data.endDate) {
      return {
        success: false,
        error: 'Start date must be before end date'
      }
    }

    const { eventId, ...updateData } = parsed.data
    const event = await calendarRepository.updateEvent(eventId, updateData)

    revalidatePath('/instructor/calendar')

    return {
      success: true,
      data: event
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error updating event'
    }
  }
}

/**
 * Delete event
 */
export async function deleteEvent(eventId: string): Promise<ActionResponse> {
  try {
    const session = await getSession()
    if (!session?.id) {
      return {
        success: false,
        error: 'User not authenticated'
      }
    }

    await calendarRepository.deleteEvent(eventId)

    revalidatePath('/instructor/calendar')

    return {
      success: true,
      data: { id: eventId }
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error deleting event'
    }
  }
}

/**
 * Search events
 */
export async function searchEvents(query: string): Promise<ActionResponse> {
  try {
    const session = await getSession()
    if (!session?.id) {
      return {
        success: false,
        error: 'User not authenticated'
      }
    }

    if (!query || query.trim().length < 2) {
      return {
        success: false,
        error: 'Search query must be at least 2 characters'
      }
    }

    const results = await calendarRepository.searchEvents(session.id, query)

    return {
      success: true,
      data: results
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error searching events'
    }
  }
}

/**
 * Get upcoming events
 */
export async function getUpcomingEvents(days: number = 7): Promise<ActionResponse> {
  try {
    const session = await getSession()
    if (!session?.id) {
      return {
        success: false,
        error: 'User not authenticated'
      }
    }

    const events = await calendarRepository.getUpcomingEvents(session.id, days)

    return {
      success: true,
      data: events
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error getting upcoming events'
    }
  }
}

/**
 * Get month statistics
 */
export async function getMonthStats(year: number, month: number): Promise<ActionResponse> {
  try {
    const session = await getSession()
    if (!session?.id) {
      return {
        success: false,
        error: 'User not authenticated'
      }
    }

    const stats = await calendarRepository.getMonthStats(session.id, year, month)

    return {
      success: true,
      data: stats
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error getting statistics'
    }
  }
}

/**
 * Check availability for a time slot
 */
export async function checkAvailability(startDate: Date, endDate: Date): Promise<ActionResponse> {
  try {
    const session = await getSession()
    if (!session?.id) {
      return {
        success: false,
        error: 'User not authenticated'
      }
    }

    const isAvailable = await calendarRepository.isTimeSlotAvailable(session.id, new Date(startDate), new Date(endDate))

    return {
      success: true,
      data: { isAvailable }
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error checking availability'
    }
  }
}
