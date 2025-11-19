/**
 * Course Published Domain Event
 */

import { DomainEvent, type DomainEventProps } from '@/core/shared/domain-event';

interface CoursePublishedProps extends DomainEventProps {
  courseId: string;
  instructorId: string;
  title: string;
  publishedAt: Date;
}

export class CoursePublishedEvent extends DomainEvent {
  public readonly courseId: string;
  public readonly instructorId: string;
  public readonly title: string;
  public readonly publishedAt: Date;

  constructor(props: CoursePublishedProps) {
    super({ aggregateId: props.courseId, ...props });
    this.courseId = props.courseId;
    this.instructorId = props.instructorId;
    this.title = props.title;
    this.publishedAt = props.publishedAt;
  }

  toObject(): Record<string, unknown> {
    return {
      eventId: this.eventId,
      eventName: this.eventName,
      occurredAt: this.occurredAt,
      courseId: this.courseId,
      instructorId: this.instructorId,
      title: this.title,
      publishedAt: this.publishedAt,
    };
  }
}
