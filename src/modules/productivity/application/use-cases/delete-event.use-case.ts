/**
 * Delete Calendar Event Use Case
 */

import { ForbiddenError, NotFoundError } from '@/core/shared/errors'
import { Result } from '@/core/shared/result'
import { BaseUseCase } from '@/core/shared/use-case.interface'
import type { ICalendarEventRepository } from '../../domain/calendar-event.repository.interface'

interface DeleteEventRequest {
  eventId: string
  currentUserId: string
}

export class DeleteEventUseCase extends BaseUseCase<DeleteEventRequest, void> {
  constructor(private eventRepository: ICalendarEventRepository) {
    super()
  }

  async execute(request: DeleteEventRequest): Promise<Result<void>> {
    const { eventId, currentUserId } = request

    // Find event
    const eventResult = await this.eventRepository.findById(eventId)

    if (eventResult.isFailure) {
      return Result.fail(eventResult.error)
    }

    if (!eventResult.value) {
      return Result.fail(new NotFoundError('CalendarEvent', eventId))
    }

    const event = eventResult.value

    // Check permissions
    if (!event.canBeEditedBy(currentUserId)) {
      return Result.fail(new ForbiddenError('You do not have permission to delete this event'))
    }

    // Delete from repository
    const deleteResult = await this.eventRepository.delete(eventId)

    if (deleteResult.isFailure) {
      return Result.fail(deleteResult.error)
    }

    return Result.ok(undefined)
  }
}
