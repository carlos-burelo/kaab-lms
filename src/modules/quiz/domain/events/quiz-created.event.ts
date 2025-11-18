/**
 * Quiz Created Domain Event
 */

import { DomainEvent } from '@/core/shared/domain-event';

export interface QuizCreatedEventPayload {
  quizId: string;
  lessonId: string;
  title: string;
}

export class QuizCreatedEvent extends DomainEvent<QuizCreatedEventPayload> {
  constructor(payload: QuizCreatedEventPayload) {
    super('quiz.created', payload);
  }
}
