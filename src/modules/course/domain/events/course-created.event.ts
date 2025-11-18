/**
 * Course Created Domain Event
 */

import { DomainEvent, DomainEventProps } from '@/core/shared/domain-event';

interface CourseCreatedProps extends DomainEventProps {
  courseId: string;
  instructorId: string;
  title: string;
  slug: string;
}

export class CourseCreatedEvent extends DomainEvent {
  public readonly courseId: string;
  public readonly instructorId: string;
  public readonly title: string;
  public readonly slug: string;

  constructor(props: CourseCreatedProps) {
    super({ aggregateId: props.courseId, ...props });
    this.courseId = props.courseId;
    this.instructorId = props.instructorId;
    this.title = props.title;
    this.slug = props.slug;
  }

  toObject(): Record<string, unknown> {
    return {
      eventId: this.eventId,
      eventName: this.eventName,
      occurredAt: this.occurredAt,
      courseId: this.courseId,
      instructorId: this.instructorId,
      title: this.title,
      slug: this.slug,
    };
  }
}
