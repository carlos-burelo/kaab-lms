/**
 * CalendarEvent Mapper
 */

import { Mapper } from '@/core/shared/mapper.interface';
import { CalendarEvent, CalendarEventProps } from '../domain/calendar-event.entity';
import { EventType } from '../domain/value-objects';
import type { CalendarEvent as PrismaCalendarEvent } from '@prisma/client';

export interface CalendarEventDTO {
  id: string;
  userId: string;
  title: string;
  description?: string;
  type: EventType;
  startDate: Date;
  endDate: Date;
  location?: string;
  color?: string;
  isAllDay: boolean;
  reminder?: number;
  createdAt: Date;
  updatedAt: Date;
}

class CalendarEventMapper implements Mapper<CalendarEvent, PrismaCalendarEvent, CalendarEventDTO> {
  toDomain(raw: PrismaCalendarEvent): CalendarEvent {
    const props: CalendarEventProps = {
      userId: raw.userId,
      title: raw.title,
      description: raw.description || undefined,
      type: raw.type as EventType,
      startDate: raw.startDate,
      endDate: raw.endDate,
      location: raw.location || undefined,
      color: raw.color || undefined,
      isAllDay: raw.isAllDay,
      reminder: raw.reminder || undefined,
      id: raw.id,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };

    // Use factory method instead of direct instantiation
    const result = CalendarEvent.create(props);
    if (result.isFailure) {
      throw new Error(`Failed to create CalendarEvent entity: ${result.error.message}`);
    }

    return result.value;
  }

  toPersistence(entity: CalendarEvent): Omit<PrismaCalendarEvent, 'createdAt' | 'updatedAt'> {
    return {
      id: entity.id,
      userId: entity.userId,
      title: entity.title,
      description: entity.description || null,
      type: entity.type,
      startDate: entity.startDate,
      endDate: entity.endDate,
      location: entity.location || null,
      color: entity.color || null,
      isAllDay: entity.isAllDay,
      reminder: entity.reminder || null,
    };
  }

  toDTO(entity: CalendarEvent): CalendarEventDTO {
    return {
      id: entity.id,
      userId: entity.userId,
      title: entity.title,
      description: entity.description,
      type: entity.type,
      startDate: entity.startDate,
      endDate: entity.endDate,
      location: entity.location,
      color: entity.color,
      isAllDay: entity.isAllDay,
      reminder: entity.reminder,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}

export const calendarEventMapper = new CalendarEventMapper();
