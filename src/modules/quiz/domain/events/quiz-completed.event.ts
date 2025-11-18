/**
 * Quiz Completed Domain Event
 */

import { DomainEvent } from '@/core/shared/domain-event';

export interface QuizCompletedEventPayload {
  quizId: string;
  userId: string;
  attemptId: string;
  score: number;
  passed: boolean;
}

export class QuizCompletedEvent extends DomainEvent<QuizCompletedEventPayload> {
  constructor(payload: QuizCompletedEventPayload) {
    super('quiz.completed', payload);
  }
}
