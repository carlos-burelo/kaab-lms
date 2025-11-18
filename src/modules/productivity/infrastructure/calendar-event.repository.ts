/**
 * CalendarEvent Repository Implementation
 */

import { Result } from '@/core/shared/result';
import { DatabaseError } from '@/core/shared/errors';
import { prisma } from '@/lib/prisma';
import { CalendarEvent } from '../domain/calendar-event.entity';
import { ICalendarEventRepository } from '../domain/calendar-event.repository.interface';
import { EventType } from '../domain/value-objects';
import { calendarEventMapper } from './calendar-event.mapper';
import { eventBus } from '@/core/infrastructure/event-bus';

export class CalendarEventRepository implements ICalendarEventRepository {
  async findById(id: string): Promise<Result<CalendarEvent | null>> {
    try {
      const event = await prisma.calendarEvent.findUnique({
        where: { id },
      });

      if (!event) return Result.ok(null);

      return Result.ok(calendarEventMapper.toDomain(event));
    } catch (error) {
      return Result.fail(
        new DatabaseError('Failed to find event', error as Error)
      );
    }
  }

  async findByUserId(userId: string): Promise<Result<CalendarEvent[]>> {
    try {
      const events = await prisma.calendarEvent.findMany({
        where: { userId },
        orderBy: { startDate: 'asc' },
      });

      return Result.ok(events.map(event => calendarEventMapper.toDomain(event)));
    } catch (error) {
      return Result.fail(
        new DatabaseError('Failed to find events by user', error as Error)
      );
    }
  }

  async findByUserAndType(
    userId: string,
    type: EventType
  ): Promise<Result<CalendarEvent[]>> {
    try {
      const events = await prisma.calendarEvent.findMany({
        where: { userId, type },
        orderBy: { startDate: 'asc' },
      });

      return Result.ok(events.map(event => calendarEventMapper.toDomain(event)));
    } catch (error) {
      return Result.fail(
        new DatabaseError('Failed to find events by user and type', error as Error)
      );
    }
  }

  async findByDateRange(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Result<CalendarEvent[]>> {
    try {
      const events = await prisma.calendarEvent.findMany({
        where: {
          userId,
          AND: [
            {
              startDate: {
                lte: endDate,
              },
            },
            {
              endDate: {
                gte: startDate,
              },
            },
          ],
        },
        orderBy: { startDate: 'asc' },
      });

      return Result.ok(events.map(event => calendarEventMapper.toDomain(event)));
    } catch (error) {
      return Result.fail(
        new DatabaseError('Failed to find events by date range', error as Error)
      );
    }
  }

  async findUpcomingEvents(
    userId: string,
    limit?: number
  ): Promise<Result<CalendarEvent[]>> {
    try {
      const now = new Date();
      const events = await prisma.calendarEvent.findMany({
        where: {
          userId,
          startDate: {
            gte: now,
          },
        },
        orderBy: { startDate: 'asc' },
        take: limit,
      });

      return Result.ok(events.map(event => calendarEventMapper.toDomain(event)));
    } catch (error) {
      return Result.fail(
        new DatabaseError('Failed to find upcoming events', error as Error)
      );
    }
  }

  async findEventsToday(userId: string): Promise<Result<CalendarEvent[]>> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const events = await prisma.calendarEvent.findMany({
        where: {
          userId,
          AND: [
            {
              startDate: {
                lt: tomorrow,
              },
            },
            {
              endDate: {
                gte: today,
              },
            },
          ],
        },
        orderBy: { startDate: 'asc' },
      });

      return Result.ok(events.map(event => calendarEventMapper.toDomain(event)));
    } catch (error) {
      return Result.fail(
        new DatabaseError('Failed to find events today', error as Error)
      );
    }
  }

  async findEventsThisWeek(userId: string): Promise<Result<CalendarEvent[]>> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Get start of week (Sunday)
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());

      // Get end of week (Saturday)
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 7);

      const events = await prisma.calendarEvent.findMany({
        where: {
          userId,
          AND: [
            {
              startDate: {
                lt: endOfWeek,
              },
            },
            {
              endDate: {
                gte: startOfWeek,
              },
            },
          ],
        },
        orderBy: { startDate: 'asc' },
      });

      return Result.ok(events.map(event => calendarEventMapper.toDomain(event)));
    } catch (error) {
      return Result.fail(
        new DatabaseError('Failed to find events this week', error as Error)
      );
    }
  }

  async findEventsThisMonth(userId: string): Promise<Result<CalendarEvent[]>> {
    try {
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);

      const events = await prisma.calendarEvent.findMany({
        where: {
          userId,
          AND: [
            {
              startDate: {
                lte: endOfMonth,
              },
            },
            {
              endDate: {
                gte: startOfMonth,
              },
            },
          ],
        },
        orderBy: { startDate: 'asc' },
      });

      return Result.ok(events.map(event => calendarEventMapper.toDomain(event)));
    } catch (error) {
      return Result.fail(
        new DatabaseError('Failed to find events this month', error as Error)
      );
    }
  }

  async findConflictingEvents(
    userId: string,
    startDate: Date,
    endDate: Date,
    excludeEventId?: string
  ): Promise<Result<CalendarEvent[]>> {
    try {
      const events = await prisma.calendarEvent.findMany({
        where: {
          userId,
          id: excludeEventId ? { not: excludeEventId } : undefined,
          AND: [
            {
              startDate: {
                lt: endDate,
              },
            },
            {
              endDate: {
                gt: startDate,
              },
            },
          ],
        },
        orderBy: { startDate: 'asc' },
      });

      return Result.ok(events.map(event => calendarEventMapper.toDomain(event)));
    } catch (error) {
      return Result.fail(
        new DatabaseError('Failed to find conflicting events', error as Error)
      );
    }
  }

  async countByType(
    userId: string,
    type: EventType
  ): Promise<Result<number>> {
    try {
      const count = await prisma.calendarEvent.count({
        where: { userId, type },
      });

      return Result.ok(count);
    } catch (error) {
      return Result.fail(
        new DatabaseError('Failed to count events by type', error as Error)
      );
    }
  }

  async getEventStats(
    userId: string
  ): Promise<
    Result<{
      total: number;
      upcoming: number;
      past: number;
      today: number;
      thisWeek: number;
      thisMonth: number;
    }>
  > {
    try {
      const now = new Date();
      const today = new Date(now);
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Get start of week (Sunday)
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 7);

      // Get start and end of month
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);

      const [
        total,
        upcoming,
        past,
        todayCount,
        thisWeekCount,
        thisMonthCount,
      ] = await Promise.all([
        prisma.calendarEvent.count({ where: { userId } }),
        prisma.calendarEvent.count({
          where: { userId, startDate: { gte: now } },
        }),
        prisma.calendarEvent.count({
          where: { userId, endDate: { lt: now } },
        }),
        prisma.calendarEvent.count({
          where: {
            userId,
            AND: [
              { startDate: { lt: tomorrow } },
              { endDate: { gte: today } },
            ],
          },
        }),
        prisma.calendarEvent.count({
          where: {
            userId,
            AND: [
              { startDate: { lt: endOfWeek } },
              { endDate: { gte: startOfWeek } },
            ],
          },
        }),
        prisma.calendarEvent.count({
          where: {
            userId,
            AND: [
              { startDate: { lte: endOfMonth } },
              { endDate: { gte: startOfMonth } },
            ],
          },
        }),
      ]);

      return Result.ok({
        total,
        upcoming,
        past,
        today: todayCount,
        thisWeek: thisWeekCount,
        thisMonth: thisMonthCount,
      });
    } catch (error) {
      return Result.fail(
        new DatabaseError('Failed to get event stats', error as Error)
      );
    }
  }

  async save(entity: CalendarEvent): Promise<Result<CalendarEvent>> {
    try {
      const model = calendarEventMapper.toPersistence(entity);

      const saved = await prisma.calendarEvent.upsert({
        where: { id: entity.id },
        create: model,
        update: model,
      });

      // Publish domain events
      for (const event of entity.domainEvents) {
        await eventBus.publish(event);
      }
      entity.clearEvents();

      return Result.ok(calendarEventMapper.toDomain(saved));
    } catch (error) {
      return Result.fail(
        new DatabaseError('Failed to save event', error as Error)
      );
    }
  }

  async delete(id: string): Promise<Result<void>> {
    try {
      await prisma.calendarEvent.delete({
        where: { id },
      });

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(
        new DatabaseError('Failed to delete event', error as Error)
      );
    }
  }

  async exists(id: string): Promise<Result<boolean>> {
    try {
      const count = await prisma.calendarEvent.count({
        where: { id },
      });

      return Result.ok(count > 0);
    } catch (error) {
      return Result.fail(
        new DatabaseError('Failed to check event existence', error as Error)
      );
    }
  }
}
