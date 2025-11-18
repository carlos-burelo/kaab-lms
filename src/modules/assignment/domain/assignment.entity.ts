/**
 * Assignment Aggregate Root
 */

import { AggregateRoot, EntityProps } from '@/core/shared/aggregate-root';
import { Result } from '@/core/shared/result';
import { BusinessRuleError, ValidationError } from '@/core/shared/errors';
import {
  AssignmentCreatedEvent,
  AssignmentSubmittedEvent,
  AssignmentGradedEvent,
} from './events';

export interface AssignmentProps extends EntityProps {
  title: string;
  description?: string;
  instructions?: string;
  dueDate?: Date;
  maxScore: number;
  lessonId: string;
  allowLateSubmission?: boolean;
  latePenaltyPercent?: number | null;
}

export class Assignment extends AggregateRoot<AssignmentProps> {
  get title(): string {
    return this._props.title;
  }

  get description(): string | undefined {
    return this._props.description;
  }

  get instructions(): string | undefined {
    return this._props.instructions;
  }

  get dueDate(): Date | undefined {
    return this._props.dueDate;
  }

  get maxScore(): number {
    return this._props.maxScore;
  }

  get lessonId(): string {
    return this._props.lessonId;
  }

  get allowLateSubmission(): boolean {
    return this._props.allowLateSubmission ?? false;
  }

  get latePenaltyPercent(): number | null | undefined {
    return this._props.latePenaltyPercent;
  }

  private constructor(props: AssignmentProps, id?: string) {
    super(props, id);
  }

  /**
   * Create a new assignment
   */
  static create(
    props: Omit<AssignmentProps, 'id' | 'createdAt' | 'updatedAt'>
  ): Result<Assignment, ValidationError> {
    // Validations
    if (props.title.trim().length < 3) {
      return Result.fail(
        new ValidationError('Title must be at least 3 characters', 'title')
      );
    }

    if (props.maxScore <= 0) {
      return Result.fail(
        new ValidationError('Max score must be positive', 'maxScore')
      );
    }

    if (props.dueDate && props.dueDate < new Date()) {
      return Result.fail(
        new ValidationError('Due date must be in the future', 'dueDate')
      );
    }

    const assignment = new Assignment(
      {
        ...props,
      },
      props.id
    );

    // Emit domain event
    assignment.addDomainEvent(
      new AssignmentCreatedEvent({
        assignmentId: assignment.id,
        lessonId: assignment.lessonId,
        title: assignment.title,
        dueDate: assignment.dueDate,
      })
    );

    return Result.ok(assignment);
  }

  /**
   * Update assignment title
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
   * Update assignment description
   */
  updateDescription(description: string): void {
    this._props.description = description;
    this.touch();
  }

  /**
   * Update due date
   */
  updateDueDate(dueDate: Date): Result<void, ValidationError> {
    if (dueDate < new Date()) {
      return Result.fail(
        new ValidationError('Due date must be in the future', 'dueDate')
      );
    }

    this._props.dueDate = dueDate;
    this.touch();

    return Result.ok(undefined);
  }

  /**
   * Update max score
   */
  updateMaxScore(score: number): Result<void, ValidationError> {
    if (score <= 0) {
      return Result.fail(
        new ValidationError('Max score must be positive', 'maxScore')
      );
    }

    this._props.maxScore = score;
    this.touch();

    return Result.ok(undefined);
  }

  /**
   * Check if assignment is overdue
   */
  isOverdue(): boolean {
    if (!this._props.dueDate) return false;
    return this._props.dueDate < new Date();
  }

  /**
   * Check if user can submit assignment
   */
  canSubmit(): Result<void, BusinessRuleError> {
    if (this.isOverdue() && !this.allowLateSubmission) {
      return Result.fail(
        new BusinessRuleError('Cannot submit assignment after due date')
      );
    }

    return Result.ok(undefined);
  }

  /**
   * Submit assignment
   */
  submit(userId: string, content?: string, fileId?: string): Result<void, BusinessRuleError> {
    const canSubmitResult = this.canSubmit();
    if (canSubmitResult.isFailure) {
      return Result.fail(canSubmitResult.error);
    }

    // Emit domain event
    this.addDomainEvent(
      new AssignmentSubmittedEvent({
        assignmentId: this.id,
        userId,
        content,
        fileId,
        submittedAt: new Date(),
      })
    );

    return Result.ok(undefined);
  }

  /**
   * Grade assignment submission
   */
  grade(
    submissionId: string,
    score: number,
    feedback?: string
  ): Result<void, ValidationError> {
    if (score < 0 || score > this._props.maxScore) {
      return Result.fail(
        new ValidationError(
          `Score must be between 0 and ${this._props.maxScore}`,
          'score'
        )
      );
    }

    // Emit domain event
    this.addDomainEvent(
      new AssignmentGradedEvent({
        assignmentId: this.id,
        submissionId,
        score,
        feedback,
        gradedAt: new Date(),
      })
    );

    return Result.ok(undefined);
  }

  /**
   * Check if user can edit assignment
   */
  canBeEditedBy(userId: string): boolean {
    // Business rule: assignments can be edited by instructors
    // This is a placeholder - actual implementation would check user role
    return true;
  }

  toObject(): AssignmentProps & {
    id: string;
    createdAt: Date;
    updatedAt: Date;
  } {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      instructions: this.instructions,
      dueDate: this.dueDate,
      maxScore: this.maxScore,
      lessonId: this.lessonId,
      allowLateSubmission: this.allowLateSubmission,
      latePenaltyPercent: this.latePenaltyPercent,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  clone(): Assignment {
    return new Assignment({ ...this._props }, this._id);
  }
}
