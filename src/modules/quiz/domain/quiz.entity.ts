/**
 * Quiz Aggregate Root
 */

import { AggregateRoot, type EntityProps } from '@/core/shared/aggregate-root';
import { Result } from '@/core/shared/result';
import { BusinessRuleError, ValidationError } from '@/core/shared/errors';
import {
  QuizCreatedEvent,
  QuizPublishedEvent,
} from './events';

export enum QuestionType {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  SINGLE_CHOICE = 'SINGLE_CHOICE',
  TRUE_FALSE = 'TRUE_FALSE',
  SHORT_ANSWER = 'SHORT_ANSWER',
  LONG_ANSWER = 'LONG_ANSWER',
  ORDERING = 'ORDERING',
  MATCHING = 'MATCHING',
}

export interface QuizProps extends EntityProps {
  title: string;
  description?: string;
  instructions?: string;
  lessonId: string;
  durationMinutes?: number;
  passingScore: number;
  maxAttempts?: number;
  showAnswers: boolean;
  shuffleQuestions: boolean;
  isPublished: boolean;
}

export class Quiz extends AggregateRoot<QuizProps> {
  get title(): string {
    return this._props.title;
  }

  get description(): string | undefined {
    return this._props.description;
  }

  get instructions(): string | undefined {
    return this._props.instructions;
  }

  get lessonId(): string {
    return this._props.lessonId;
  }

  get durationMinutes(): number | undefined {
    return this._props.durationMinutes;
  }

  get passingScore(): number {
    return this._props.passingScore;
  }

  get maxAttempts(): number | undefined {
    return this._props.maxAttempts;
  }

  get showAnswers(): boolean {
    return this._props.showAnswers;
  }

  get shuffleQuestions(): boolean {
    return this._props.shuffleQuestions;
  }

  get isPublished(): boolean {
    return this._props.isPublished;
  }

  private constructor(props: QuizProps, id?: string) {
    super(props, id);
  }

  /**
   * Create a new quiz
   */
  static create(
    props: Omit<QuizProps, 'id' | 'isPublished' | 'createdAt' | 'updatedAt'>
  ): Result<Quiz, ValidationError> {
    // Validations
    if (props.title.trim().length < 3) {
      return Result.fail(
        new ValidationError('Title must be at least 3 characters', 'title')
      );
    }

    if (props.passingScore < 0 || props.passingScore > 100) {
      return Result.fail(
        new ValidationError(
          'Passing score must be between 0 and 100',
          'passingScore'
        )
      );
    }

    if (props.durationMinutes && props.durationMinutes <= 0) {
      return Result.fail(
        new ValidationError(
          'Duration must be positive',
          'durationMinutes'
        )
      );
    }

    if (props.maxAttempts && props.maxAttempts <= 0) {
      return Result.fail(
        new ValidationError('Max attempts must be positive', 'maxAttempts')
      );
    }

    const quiz = new Quiz(
      {
        ...props,
        isPublished: false,
      },
      props.id
    );

    // Emit domain event
    quiz.addDomainEvent(
      new QuizCreatedEvent({
        quizId: quiz.id,
        lessonId: quiz.lessonId,
        title: quiz.title,
      })
    );

    return Result.ok(quiz);
  }

  /**
   * Update quiz title
   */
  updateTitle(newTitle: string): Result<void, ValidationError> {
    if (newTitle.trim().length < 3) {
      return Result.fail(
        new ValidationError('Title must be at least 3 characters', 'title')
      );
    }

    this._props.title = newTitle;
    this.touch();

    return Result.ok(undefined);
  }

  /**
   * Update quiz description
   */
  updateDescription(description: string): void {
    this._props.description = description;
    this.touch();
  }

  /**
   * Update quiz instructions
   */
  updateInstructions(instructions: string): void {
    this._props.instructions = instructions;
    this.touch();
  }

  /**
   * Update passing score
   */
  updatePassingScore(score: number): Result<void, ValidationError> {
    if (score < 0 || score > 100) {
      return Result.fail(
        new ValidationError(
          'Passing score must be between 0 and 100',
          'passingScore'
        )
      );
    }

    this._props.passingScore = score;
    this.touch();

    return Result.ok(undefined);
  }

  /**
   * Update duration
   */
  updateDuration(minutes: number): Result<void, ValidationError> {
    if (minutes <= 0) {
      return Result.fail(
        new ValidationError('Duration must be positive', 'durationMinutes')
      );
    }

    this._props.durationMinutes = minutes;
    this.touch();

    return Result.ok(undefined);
  }

  /**
   * Update max attempts
   */
  updateMaxAttempts(attempts: number): Result<void, ValidationError> {
    if (attempts <= 0) {
      return Result.fail(
        new ValidationError('Max attempts must be positive', 'maxAttempts')
      );
    }

    this._props.maxAttempts = attempts;
    this.touch();

    return Result.ok(undefined);
  }

  /**
   * Toggle show answers
   */
  toggleShowAnswers(): void {
    this._props.showAnswers = !this._props.showAnswers;
    this.touch();
  }

  /**
   * Toggle shuffle questions
   */
  toggleShuffleQuestions(): void {
    this._props.shuffleQuestions = !this._props.shuffleQuestions;
    this.touch();
  }

  /**
   * Publish quiz
   */
  publish(): Result<void, BusinessRuleError> {
    if (this._props.isPublished) {
      return Result.fail(new BusinessRuleError('Quiz is already published'));
    }

    this._props.isPublished = true;
    this.touch();

    // Emit domain event
    this.addDomainEvent(
      new QuizPublishedEvent({
        quizId: this.id,
        lessonId: this.lessonId,
        title: this.title,
      })
    );

    return Result.ok(undefined);
  }

  /**
   * Unpublish quiz
   */
  unpublish(): Result<void, BusinessRuleError> {
    if (!this._props.isPublished) {
      return Result.fail(new BusinessRuleError('Quiz is not published'));
    }

    this._props.isPublished = false;
    this.touch();

    return Result.ok(undefined);
  }

  toObject(): QuizProps & {
    id: string;
    createdAt: Date;
    updatedAt: Date;
  } {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      instructions: this.instructions,
      lessonId: this.lessonId,
      durationMinutes: this.durationMinutes,
      passingScore: this.passingScore,
      maxAttempts: this.maxAttempts,
      showAnswers: this.showAnswers,
      shuffleQuestions: this.shuffleQuestions,
      isPublished: this.isPublished,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  clone(): Quiz {
    return new Quiz({ ...this._props }, this._id);
  }
}
