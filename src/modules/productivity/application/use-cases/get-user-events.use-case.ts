/**
 * Get User Events Use Case
 */

import { BaseUseCase } from '@/core/shared/use-case.interface';
import { Result } from '@/core/shared/result';
import { ICalendarEventRepository } from '../../domain/calendar-event.repository.interface';
import { CalendarEventDTO, calendarEventMapper } from '../../infrastructure/calendar-event.mapper';
import { EventType } from '../../domain/value-objects';

interface GetUserEventsRequest {
  userId: string;
  type?: EventType;
  startDate?: Date;
  endDate?: Date;
}

export class GetUserEventsUseCase extends BaseUseCase<
  GetUserEventsRequest,
  CalendarEventDTO[]
> {
  constructor(private eventRepository: ICalendarEventRepository) {
    super();
  }

  async execute(request: GetUserEventsRequest): Promise<Result<CalendarEventDTO[]>> {
    const { userId, type, startDate, endDate } = request;

    // Find events
    let eventsResult;

    if (startDate && endDate) {
      eventsResult = await this.eventRepository.findByDateRange(userId, startDate, endDate);
    } else if (type) {
      eventsResult = await this.eventRepository.findByUserAndType(userId, type);
    } else {
      eventsResult = await this.eventRepository.findByUserId(userId);
    }

    if (eventsResult.isFailure) {
      return Result.fail(eventsResult.error);
    }

    // Map to DTOs
    const eventDTOs = eventsResult.value.map(event => calendarEventMapper.toDTO(event));

    return Result.ok(eventDTOs);
  }
}
