/**
 * CalendarEvent Aggregate Root
 */

import { AggregateRoot, type EntityProps } from '@/core/shared/aggregate-root'
import { ValidationError } from '@/core/shared/errors'
import { Result } from '@/core/shared/result'
import { EventCreatedEvent, EventRescheduledEvent, EventUpdatedEvent } from './events'
import { type EventType, getEventTypeColor } from './value-objects'

export interface CalendarEventProps extends EntityProps {
  userId: string
  title: string
  description?: string
  type: EventType
  startDate: Date
  endDate: Date
  location?: string
  color?: string
  isAllDay: boolean
  reminder?: number
}

export class CalendarEvent extends AggregateRoot<CalendarEventProps> {
  get userId(): string {
    return this._props.userId
  }

  get title(): string {
    return this._props.title
  }

  get description(): string | undefined {
    return this._props.description
  }

  get type(): EventType {
    return this._props.type
  }

  get startDate(): Date {
    return this._props.startDate
  }

  get endDate(): Date {
    return this._props.endDate
  }

  get location(): string | undefined {
    return this._props.location
  }

  get color(): string | undefined {
    return this._props.color
  }

  get isAllDay(): boolean {
    return this._props.isAllDay
  }

  get reminder(): number | undefined {
    return this._props.reminder
  }

  private constructor(props: CalendarEventProps, id?: string) {
    super(props, id)
  }

  /**
   * Create a new calendar event
   */
  static create(props: Omit<CalendarEventProps, 'id' | 'createdAt' | 'updatedAt'>): Result<CalendarEvent, ValidationError> {
    // Validations
    if (props.title.trim().length < 1) {
      return Result.fail(new ValidationError('Title cannot be empty', 'title'))
    }

    if (props.title.trim().length > 200) {
      return Result.fail(new ValidationError('Title must be less than 200 characters', 'title'))
    }

    if (props.description && props.description.length > 2000) {
      return Result.fail(new ValidationError('Description must be less than 2000 characters', 'description'))
    }

    if (props.endDate <= props.startDate) {
      return Result.fail(new ValidationError('End date must be after start date', 'endDate'))
    }

    if (props.reminder && props.reminder < 0) {
      return Result.fail(new ValidationError('Reminder must be a positive number', 'reminder'))
    }

    // Set default color based on event type if not provided
    const color = props.color || getEventTypeColor(props.type)

    const event = new CalendarEvent(
      {
        ...props,
        color
      },
      props.id
    )

    // Emit domain event
    event.addDomainEvent(
      new EventCreatedEvent({
        eventId: event.id,
        userId: event.userId,
        title: event.title,
        type: event.type,
        startDate: event.startDate,
        endDate: event.endDate
      })
    )

    return Result.ok(event)
  }

  /**
   * Update event details
   */
  update(updates: {
    title?: string
    description?: string
    type?: EventType
    location?: string
    color?: string
    isAllDay?: boolean
    reminder?: number
  }): Result<void, ValidationError> {
    // Validate title if provided
    if (updates.title !== undefined) {
      if (updates.title.trim().length < 1) {
        return Result.fail(new ValidationError('Title cannot be empty', 'title'))
      }

      if (updates.title.trim().length > 200) {
        return Result.fail(new ValidationError('Title must be less than 200 characters', 'title'))
      }

      this._props.title = updates.title
    }

    // Validate description if provided
    if (updates.description !== undefined) {
      if (updates.description.length > 2000) {
        return Result.fail(new ValidationError('Description must be less than 2000 characters', 'description'))
      }

      this._props.description = updates.description
    }

    // Validate reminder if provided
    if (updates.reminder !== undefined && updates.reminder < 0) {
      return Result.fail(new ValidationError('Reminder must be a positive number', 'reminder'))
    }

    // Apply updates
    if (updates.type !== undefined) this._props.type = updates.type
    if (updates.location !== undefined) this._props.location = updates.location
    if (updates.color !== undefined) this._props.color = updates.color
    if (updates.isAllDay !== undefined) this._props.isAllDay = updates.isAllDay
    if (updates.reminder !== undefined) this._props.reminder = updates.reminder

    this.touch()

    this.addDomainEvent(
      new EventUpdatedEvent({
        eventId: this.id,
        userId: this.userId,
        title: this.title
      })
    )

    return Result.ok(undefined)
  }

  /**
   * Reschedule the event
   */
  reschedule(newStartDate: Date, newEndDate: Date): Result<void, ValidationError> {
    if (newEndDate <= newStartDate) {
      return Result.fail(new ValidationError('End date must be after start date', 'endDate'))
    }

    const previousStartDate = this._props.startDate
    const previousEndDate = this._props.endDate

    this._props.startDate = newStartDate
    this._props.endDate = newEndDate
    this.touch()

    this.addDomainEvent(
      new EventRescheduledEvent({
        eventId: this.id,
        userId: this.userId,
        title: this.title,
        previousStartDate,
        previousEndDate,
        newStartDate,
        newEndDate
      })
    )

    return Result.ok(undefined)
  }

  /**
   * Check if event is upcoming (starts in the future)
   */
  isUpcoming(): boolean {
    return this._props.startDate > new Date()
  }

  /**
   * Check if event is in the past (ended)
   */
  isPast(): boolean {
    return this._props.endDate < new Date()
  }

  /**
   * Check if event is currently happening
   */
  isOngoing(): boolean {
    const now = new Date()
    return this._props.startDate <= now && this._props.endDate >= now
  }

  /**
   * Check if event conflicts with another event
   */
  conflicts(other: CalendarEvent): boolean {
    // Events don't conflict if they belong to different users
    if (this.userId !== other.userId) {
      return false
    }

    // Check for time overlap
    return this._props.startDate < other.endDate && this._props.endDate > other.startDate
  }

  /**
   * Get event duration in minutes
   */
  getDurationMinutes(): number {
    const diff = this._props.endDate.getTime() - this._props.startDate.getTime()
    return Math.floor(diff / (1000 * 60))
  }

  /**
   * Get event duration in hours
   */
  getDurationHours(): number {
    return this.getDurationMinutes() / 60
  }

  /**
   * Check if event can be edited by user
   */
  canBeEditedBy(userId: string): boolean {
    return this._props.userId === userId
  }

  /**
   * Check if event can be deleted (not in the past)
   */
  canBeDeleted(): boolean {
    return !this.isPast()
  }

  toObject(): CalendarEventProps & {
    id: string
    createdAt: Date
    updatedAt: Date
  } {
    return {
      id: this.id,
      userId: this.userId,
      title: this.title,
      description: this.description,
      type: this.type,
      startDate: this.startDate,
      endDate: this.endDate,
      location: this.location,
      color: this.color,
      isAllDay: this.isAllDay,
      reminder: this.reminder,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    }
  }

  clone(): CalendarEvent {
    return new CalendarEvent({ ...this._props }, this._id)
  }
}
