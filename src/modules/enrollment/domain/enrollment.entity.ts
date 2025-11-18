/**
 * Enrollment Aggregate Root
 */

import { AggregateRoot, EntityProps } from '@/core/shared/aggregate-root';
import { Result } from '@/core/shared/result';
import { BusinessRuleError, ValidationError } from '@/core/shared/errors';
import {
  StudentEnrolledEvent,
  ProgressUpdatedEvent,
  CourseCompletedEvent,
} from './events';

export interface EnrollmentProps extends EntityProps {
  userId: string;
  courseId: string;
  progress: number;
  lastLessonId?: string;
  lastAccessed?: Date;
  totalTimeMinutes: number;
  isCompleted: boolean;
  completedAt?: Date;
}

export class Enrollment extends AggregateRoot<EnrollmentProps> {
  get userId(): string {
    return this._props.userId;
  }

  get courseId(): string {
    return this._props.courseId;
  }

  get progress(): number {
    return this._props.progress;
  }

  get lastLessonId(): string | undefined {
    return this._props.lastLessonId;
  }

  get lastAccessed(): Date | undefined {
    return this._props.lastAccessed;
  }

  get totalTimeMinutes(): number {
    return this._props.totalTimeMinutes;
  }

  get isCompleted(): boolean {
    return this._props.isCompleted;
  }

  get completedAt(): Date | undefined {
    return this._props.completedAt;
  }

  private constructor(props: EnrollmentProps, id?: string) {
    super(props, id);
  }

  /**
   * Create a new enrollment
   */
  static create(
    props: Omit<
      EnrollmentProps,
      | 'id'
      | 'progress'
      | 'totalTimeMinutes'
      | 'isCompleted'
      | 'createdAt'
      | 'updatedAt'
    >
  ): Result<Enrollment, ValidationError> {
    // Validations
    if (!props.userId || props.userId.trim().length === 0) {
      return Result.fail(
        new ValidationError('User ID is required', 'userId')
      );
    }

    if (!props.courseId || props.courseId.trim().length === 0) {
      return Result.fail(
        new ValidationError('Course ID is required', 'courseId')
      );
    }

    const enrollment = new Enrollment(
      {
        ...props,
        progress: 0,
        totalTimeMinutes: 0,
        isCompleted: false,
      },
      props.id
    );

    // Emit domain event
    enrollment.addDomainEvent(
      new StudentEnrolledEvent({
        enrollmentId: enrollment.id,
        userId: enrollment.userId,
        courseId: enrollment.courseId,
      })
    );

    return Result.ok(enrollment);
  }

  /**
   * Update progress
   */
  updateProgress(
    completedLessons: number,
    totalLessons: number
  ): Result<void, ValidationError> {
    if (completedLessons < 0 || totalLessons <= 0) {
      return Result.fail(
        new ValidationError('Invalid lesson counts', 'progress')
      );
    }

    if (completedLessons > totalLessons) {
      return Result.fail(
        new ValidationError(
          'Completed lessons cannot exceed total lessons',
          'progress'
        )
      );
    }

    const oldProgress = this._props.progress;
    this._props.progress = (completedLessons / totalLessons) * 100;
    this._props.lastAccessed = new Date();
    this.touch();

    // Emit progress updated event
    this.addDomainEvent(
      new ProgressUpdatedEvent({
        enrollmentId: this.id,
        userId: this.userId,
        courseId: this.courseId,
        oldProgress,
        newProgress: this._props.progress,
      })
    );

    // Check if course is completed
    if (this._props.progress === 100 && !this._props.isCompleted) {
      const completeResult = this.complete();
      if (completeResult.isFailure) {
        return Result.fail(completeResult.error);
      }
    }

    return Result.ok(undefined);
  }

  /**
   * Complete a lesson
   */
  completeLesson(
    lessonId: string,
    timeSpentMinutes: number
  ): Result<void, ValidationError> {
    if (!lessonId || lessonId.trim().length === 0) {
      return Result.fail(
        new ValidationError('Lesson ID is required', 'lessonId')
      );
    }

    if (timeSpentMinutes < 0) {
      return Result.fail(
        new ValidationError('Time spent cannot be negative', 'timeSpentMinutes')
      );
    }

    this._props.lastLessonId = lessonId;
    this._props.lastAccessed = new Date();
    this._props.totalTimeMinutes += timeSpentMinutes;
    this.touch();

    return Result.ok(undefined);
  }

  /**
   * Complete the enrollment
   */
  complete(): Result<void, BusinessRuleError> {
    if (this._props.isCompleted) {
      return Result.fail(
        new BusinessRuleError('Enrollment is already completed')
      );
    }

    this._props.isCompleted = true;
    this._props.completedAt = new Date();
    this._props.progress = 100;
    this.touch();

    // Emit domain event
    this.addDomainEvent(
      new CourseCompletedEvent({
        enrollmentId: this.id,
        userId: this.userId,
        courseId: this.courseId,
        completedAt: this._props.completedAt,
        totalTimeMinutes: this._props.totalTimeMinutes,
      })
    );

    return Result.ok(undefined);
  }

  /**
   * Check if user can access course
   */
  canAccessCourse(): boolean {
    return !this._props.isCompleted || this._props.progress > 0;
  }

  /**
   * Update last accessed time
   */
  updateLastAccessed(): void {
    this._props.lastAccessed = new Date();
    this.touch();
  }

  toObject(): EnrollmentProps & {
    id: string;
    createdAt: Date;
    updatedAt: Date;
  } {
    return {
      id: this.id,
      userId: this.userId,
      courseId: this.courseId,
      progress: this.progress,
      lastLessonId: this.lastLessonId,
      lastAccessed: this.lastAccessed,
      totalTimeMinutes: this.totalTimeMinutes,
      isCompleted: this.isCompleted,
      completedAt: this.completedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  clone(): Enrollment {
    return new Enrollment({ ...this._props }, this._id);
  }
}
