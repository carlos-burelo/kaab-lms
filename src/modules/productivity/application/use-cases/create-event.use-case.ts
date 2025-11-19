/**
 * Create Calendar Event Use Case
 */

import { Result } from '@/core/shared/result'
import { BaseUseCase } from '@/core/shared/use-case.interface'
import { CalendarEvent } from '../../domain/calendar-event.entity'
import type { ICalendarEventRepository } from '../../domain/calendar-event.repository.interface'
import { type CalendarEventDTO, calendarEventMapper } from '../../infrastructure/calendar-event.mapper'
import type { CreateEventDTO } from '../dtos'

interface CreateEventRequest {
  dto: CreateEventDTO
  currentUserId: string
}

export class CreateEventUseCase extends BaseUseCase<CreateEventRequest, CalendarEventDTO> {
  constructor(private eventRepository: ICalendarEventRepository) {
    super()
  }

  async execute(request: CreateEventRequest): Promise<Result<CalendarEventDTO>> {
    const { dto } = request

    // Create event entity
    const eventResult = CalendarEvent.create({
      userId: dto.userId,
      title: dto.title,
      description: dto.description,
      type: dto.type,
      startDate: dto.startDate,
      endDate: dto.endDate,
      location: dto.location,
      color: dto.color,
      isAllDay: dto.isAllDay,
      reminder: dto.reminder
    })

    if (eventResult.isFailure) {
      return Result.fail(eventResult.error)
    }

    // Save to repository
    const savedResult = await this.eventRepository.save(eventResult.value)

    if (savedResult.isFailure) {
      return Result.fail(savedResult.error)
    }

    // Map to DTO
    const eventDTO = calendarEventMapper.toDTO(savedResult.value)

    return Result.ok(eventDTO)
  }
}
