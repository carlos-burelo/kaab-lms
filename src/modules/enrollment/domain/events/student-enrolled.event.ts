/**
 * Student Enrolled Domain Event
 */

import { DomainEvent } from '@/core/shared/domain-event'

export interface StudentEnrolledEventPayload {
  enrollmentId: string
  userId: string
  courseId: string
}

export class StudentEnrolledEvent extends DomainEvent<StudentEnrolledEventPayload> {
  constructor(payload: StudentEnrolledEventPayload) {
    super('enrollment.student-enrolled', payload)
  }
}
