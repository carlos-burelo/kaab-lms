/**
 * Course Completed Domain Event
 */

import { DomainEvent } from '@/core/shared/domain-event'

export interface CourseCompletedEventPayload {
  enrollmentId: string
  userId: string
  courseId: string
  completedAt: Date
  totalTimeMinutes: number
}

export class CourseCompletedEvent extends DomainEvent<CourseCompletedEventPayload> {
  constructor(payload: CourseCompletedEventPayload) {
    super('enrollment.course-completed', payload)
  }
}
