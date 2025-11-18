/**
 * Quiz Published Domain Event
 */

import { DomainEvent } from '@/core/shared/domain-event';

export interface QuizPublishedEventPayload {
  quizId: string;
  lessonId: string;
  title: string;
}

export class QuizPublishedEvent extends DomainEvent<QuizPublishedEventPayload> {
  constructor(payload: QuizPublishedEventPayload) {
    super('quiz.published', payload);
  }
}
