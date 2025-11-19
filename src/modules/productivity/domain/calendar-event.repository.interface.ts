/**
 * CalendarEvent Repository Interface
 */

import type { Repository } from '@/core/shared/repository.interface'
import type { Result } from '@/core/shared/result'
import type { CalendarEvent } from './calendar-event.entity'
import type { EventType } from './value-objects'

export interface ICalendarEventRepository extends Repository<CalendarEvent> {
  /**
   * Find all events by user ID
   */
  findByUserId(userId: string): Promise<Result<CalendarEvent[]>>

  /**
   * Find events by user and type
   */
  findByUserAndType(userId: string, type: EventType): Promise<Result<CalendarEvent[]>>

  /**
   * Find events in a date range
   */
  findByDateRange(userId: string, startDate: Date, endDate: Date): Promise<Result<CalendarEvent[]>>

  /**
   * Find upcoming events for a user
   */
  findUpcomingEvents(userId: string, limit?: number): Promise<Result<CalendarEvent[]>>

  /**
   * Find events for today
   */
  findEventsToday(userId: string): Promise<Result<CalendarEvent[]>>

  /**
   * Find events for this week
   */
  findEventsThisWeek(userId: string): Promise<Result<CalendarEvent[]>>

  /**
   * Find events for this month
   */
  findEventsThisMonth(userId: string): Promise<Result<CalendarEvent[]>>

  /**
   * Check for conflicting events
   */
  findConflictingEvents(userId: string, startDate: Date, endDate: Date, excludeEventId?: string): Promise<Result<CalendarEvent[]>>

  /**
   * Count events by type for a user
   */
  countByType(userId: string, type: EventType): Promise<Result<number>>

  /**
   * Get event statistics for a user
   */
  getEventStats(userId: string): Promise<
    Result<{
      total: number
      upcoming: number
      past: number
      today: number
      thisWeek: number
      thisMonth: number
    }>
  >
}
