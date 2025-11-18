/**
 * Get Calendar Event Use Case
 */

import { BaseUseCase } from '@/core/shared/use-case.interface';
import { Result } from '@/core/shared/result';
import { NotFoundError, ForbiddenError } from '@/core/shared/errors';
import { ICalendarEventRepository } from '../../domain/calendar-event.repository.interface';
import { CalendarEventDTO, calendarEventMapper } from '../../infrastructure/calendar-event.mapper';

interface GetEventRequest {
  eventId: string;
  currentUserId: string;
}

export class GetEventUseCase extends BaseUseCase<
  GetEventRequest,
  CalendarEventDTO
> {
  constructor(private eventRepository: ICalendarEventRepository) {
    super();
  }

  async execute(request: GetEventRequest): Promise<Result<CalendarEventDTO>> {
    const { eventId, currentUserId } = request;

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
        new ForbiddenError('You do not have permission to view this event')
      );
    }

    // Map to DTO
    const eventDTO = calendarEventMapper.toDTO(event);

    return Result.ok(eventDTO);
  }
}
