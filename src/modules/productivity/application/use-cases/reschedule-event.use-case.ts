/**
 * Reschedule Calendar Event Use Case
 */

import { BaseUseCase } from '@/core/shared/use-case.interface';
import { Result } from '@/core/shared/result';
import { NotFoundError, ForbiddenError } from '@/core/shared/errors';
import type { ICalendarEventRepository } from '../../domain/calendar-event.repository.interface';
import { type CalendarEventDTO, calendarEventMapper } from '../../infrastructure/calendar-event.mapper';

interface RescheduleEventRequest {
  eventId: string;
  newStartDate: Date;
  newEndDate: Date;
  currentUserId: string;
}

export class RescheduleEventUseCase extends BaseUseCase<
  RescheduleEventRequest,
  CalendarEventDTO
> {
  constructor(private eventRepository: ICalendarEventRepository) {
    super();
  }

  async execute(request: RescheduleEventRequest): Promise<Result<CalendarEventDTO>> {
    const { eventId, newStartDate, newEndDate, currentUserId } = request;

    // Find event
    const eventResult = await this.eventRepository.findById(eventId);

    if (eventResult.isFailure) {
      return Result.fail(eventResult.error);
    }

    if (!eventResult.value) {
      return Result.fail(new NotFoundError('CalendarEvent', eventId));
    }

    const event = eventResult.value;

    // Check permissions
    if (!event.canBeEditedBy(currentUserId)) {
      return Result.fail(
        new ForbiddenError('You do not have permission to reschedule this event')
      );
    }

    // Reschedule event
    const rescheduleResult = event.reschedule(newStartDate, newEndDate);

    if (rescheduleResult.isFailure) {
      return Result.fail(rescheduleResult.error);
    }

    // Save to repository
    const savedResult = await this.eventRepository.save(event);

    if (savedResult.isFailure) {
      return Result.fail(savedResult.error);
    }

    // Map to DTO
    const eventDTO = calendarEventMapper.toDTO(savedResult.value);

    return Result.ok(eventDTO);
  }
}
