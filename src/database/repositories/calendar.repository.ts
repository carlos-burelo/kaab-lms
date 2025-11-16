import { prisma } from '@/database/client'

interface CalendarEventData {
  title: string
  description?: string
  startDate: Date
  endDate: Date
  allDay?: boolean
  location?: string
  color?: string
  reminders?: any
  type?: 'PERSONAL' | 'COURSE' | 'MEETING' | 'SUBMISSION' | 'EXAM' | 'OTHER'
  metadata?: any
}

interface CalendarFilters {
  userId: string
  fromDate?: Date
  toDate?: Date
  type?: string
  search?: string
}

interface CalendarEventWithCount {
  id: string
  userId: string
  title: string
  description?: string
  startDate: Date
  endDate: Date
  allDay: boolean
  location?: string
  color?: string
  reminders?: any
  type: string
  metadata?: any
  createdAt: Date
  updatedAt: Date
}

export class CalendarRepository {
  /**
   * Create a new calendar event
   */
  async createEvent(userId: string, data: CalendarEventData) {
    return prisma.calendarEvent.create({
      data: {
        ...data,
        userId
      }
    })
  }

  /**
   * Get all events for a user
   */
  async getUserEvents(userId: string, filters: Partial<CalendarFilters> = {}) {
    const where: any = { userId }

    if (filters.fromDate && filters.toDate) {
      where.OR = [
        {
          startDate: {
            lte: filters.toDate
          },
          endDate: {
            gte: filters.fromDate
          }
        }
      ]
    }

    if (filters.type) {
      where.type = filters.type
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } }
      ]
    }

    return prisma.calendarEvent.findMany({
      where,
      orderBy: { startDate: 'asc' }
    })
  }

  /**
   * Get events for a specific date range
   */
  async getEventsByDateRange(userId: string, fromDate: Date, toDate: Date) {
    return prisma.calendarEvent.findMany({
      where: {
        userId,
        OR: [
          {
            startDate: {
              lte: toDate
            },
            endDate: {
              gte: fromDate
            }
          }
        ]
      },
      orderBy: { startDate: 'asc' }
    })
  }

  /**
   * Get events for a specific month
   */
  async getMonthEvents(userId: string, year: number, month: number) {
    const startOfMonth = new Date(year, month, 1)
    const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999)

    return this.getEventsByDateRange(userId, startOfMonth, endOfMonth)
  }

  /**
   * Get events for a specific week
   */
  async getWeekEvents(userId: string, date: Date) {
    const dayOfWeek = date.getDay()
    const startOfWeek = new Date(date)
    startOfWeek.setDate(date.getDate() - dayOfWeek)
    startOfWeek.setHours(0, 0, 0, 0)

    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)
    endOfWeek.setHours(23, 59, 59, 999)

    return this.getEventsByDateRange(userId, startOfWeek, endOfWeek)
  }

  /**
   * Get events for a specific day
   */
  async getDayEvents(userId: string, date: Date) {
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    return this.getEventsByDateRange(userId, startOfDay, endOfDay)
  }

  /**
   * Get upcoming events
   */
  async getUpcomingEvents(userId: string, days: number = 7) {
    const now = new Date()
    const futureDate = new Date()
    futureDate.setDate(now.getDate() + days)

    return prisma.calendarEvent.findMany({
      where: {
        userId,
        startDate: {
          gte: now,
          lte: futureDate
        }
      },
      orderBy: { startDate: 'asc' }
    })
  }

  /**
   * Get event by ID
   */
  async getEventById(eventId: string, _userId: string) {
    return prisma.calendarEvent.findUnique({
      where: { id: eventId }
      // Verify ownership
    })
  }

  /**
   * Update event
   */
  async updateEvent(eventId: string, data: Partial<CalendarEventData>) {
    return prisma.calendarEvent.update({
      where: { id: eventId },
      data
    })
  }

  /**
   * Delete event
   */
  async deleteEvent(eventId: string) {
    return prisma.calendarEvent.delete({
      where: { id: eventId }
    })
  }

  /**
   * Get events by type
   */
  async getEventsByType(userId: string, type: string) {
    return prisma.calendarEvent.findMany({
      where: {
        userId,
        type
      },
      orderBy: { startDate: 'asc' }
    })
  }

  /**
   * Count events in date range
   */
  async countEventsInRange(userId: string, fromDate: Date, toDate: Date) {
    return prisma.calendarEvent.count({
      where: {
        userId,
        OR: [
          {
            startDate: {
              lte: toDate
            },
            endDate: {
              gte: fromDate
            }
          }
        ]
      }
    })
  }

  /**
   * Get busy times for a date
   */
  async getBusyTimes(userId: string, date: Date) {
    const dayEvents = await this.getDayEvents(userId, date)
    return dayEvents
      .filter((event) => !event.allDay)
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
  }

  /**
   * Search events
   */
  async searchEvents(userId: string, query: string) {
    return prisma.calendarEvent.findMany({
      where: {
        userId,
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { location: { contains: query, mode: 'insensitive' } }
        ]
      },
      orderBy: { startDate: 'asc' },
      take: 50
    })
  }

  /**
   * Get event statistics for a month
   */
  async getMonthStats(userId: string, year: number, month: number) {
    const events = await this.getMonthEvents(userId, year, month)

    const stats = {
      total: events.length,
      byType: {} as Record<string, number>,
      allDayCount: 0,
      timedCount: 0
    }

    events.forEach((event) => {
      stats.byType[event.type] = (stats.byType[event.type] || 0) + 1
      if (event.allDay) {
        stats.allDayCount++
      } else {
        stats.timedCount++
      }
    })

    return stats
  }

  /**
   * Check availability for a time slot
   */
  async isTimeSlotAvailable(userId: string, startDate: Date, endDate: Date) {
    const conflict = await prisma.calendarEvent.findFirst({
      where: {
        userId,
        OR: [
          {
            startDate: {
              lt: endDate
            },
            endDate: {
              gt: startDate
            }
          }
        ]
      }
    })

    return !conflict
  }

  /**
   * Bulk create events
   */
  async bulkCreateEvents(userId: string, events: CalendarEventData[]) {
    return Promise.all(
      events.map((event) =>
        prisma.calendarEvent.create({
          data: {
            ...event,
            userId
          }
        })
      )
    )
  }

  /**
   * Get events with pagination
   */
  async getEventsPaginated(userId: string, limit: number = 50, offset: number = 0) {
    const [events, total] = await Promise.all([
      prisma.calendarEvent.findMany({
        where: { userId },
        orderBy: { startDate: 'asc' },
        take: limit,
        skip: offset
      }),
      prisma.calendarEvent.count({ where: { userId } })
    ])

    return { events, total, limit, offset }
  }
}

export const calendarRepository = new CalendarRepository()
