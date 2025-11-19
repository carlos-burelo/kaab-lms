/**
 * Update Calendar Event Use Case
 */

import { BaseUseCase } from '@/core/shared/use-case.interface';
import { Result } from '@/core/shared/result';
import { NotFoundError, ForbiddenError } from '@/core/shared/errors';
import type { ICalendarEventRepository } from '../../domain/calendar-event.repository.interface';
import type { UpdateEventDTO } from '../dtos';
import { type CalendarEventDTO, calendarEventMapper } from '../../infrastructure/calendar-event.mapper';

interface UpdateEventRequest {
  eventId: string;
  dto: UpdateEventDTO;
  currentUserId: string;
}

export class UpdateEventUseCase extends BaseUseCase<
  UpdateEventRequest,
  CalendarEventDTO
> {
  constructor(private eventRepository: ICalendarEventRepository) {
    super();
  }

  async execute(request: UpdateEventRequest): Promise<Result<CalendarEventDTO>> {
    const { eventId, dto, currentUserId } = request;

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
        new ForbiddenError('You do not have permission to edit this event')
      );
    }

    // Handle rescheduling separately if both dates are provided
    if (dto.startDate && dto.endDate) {
      const rescheduleResult = event.reschedule(dto.startDate, dto.endDate);
      if (rescheduleResult.isFailure) {
        return Result.fail(rescheduleResult.error);
      }
    }

    // Update other properties
    const updateData: {
      title?: string;
      description?: string;
      type?: any;
      location?: string;
      color?: string;
      isAllDay?: boolean;
      reminder?: number;
    } = {};

    if (dto.title !== undefined) updateData.title = dto.title;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.type !== undefined) updateData.type = dto.type;
    if (dto.location !== undefined) updateData.location = dto.location || undefined;
    if (dto.color !== undefined) updateData.color = dto.color || undefined;
    if (dto.isAllDay !== undefined) updateData.isAllDay = dto.isAllDay;
    if (dto.reminder !== undefined) updateData.reminder = dto.reminder || undefined;

    if (Object.keys(updateData).length > 0) {
      const updateResult = event.update(updateData);
      if (updateResult.isFailure) {
        return Result.fail(updateResult.error);
      }
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
