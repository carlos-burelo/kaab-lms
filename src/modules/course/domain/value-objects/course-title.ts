/**
 * Course Title Value Object
 */

import { ValueObject } from '@/core/shared/value-object';
import { ValidationError } from '@/core/shared/errors';
import { Result } from '@/core/shared/result';

interface CourseTitleProps {
  value: string;
}

export class CourseTitle extends ValueObject<CourseTitleProps> {
  private static readonly MIN_LENGTH = 3;
  private static readonly MAX_LENGTH = 200;

  get value(): string {
    return this.props.value;
  }

  private constructor(props: CourseTitleProps) {
    super(props);
  }

  static create(title: string): Result<CourseTitle, ValidationError> {
    // Trim and validate
    const trimmed = title.trim();

    if (trimmed.length < CourseTitle.MIN_LENGTH) {
      return Result.fail(
        new ValidationError(
          `Title must be at least ${CourseTitle.MIN_LENGTH} characters`,
          'title',
          { minLength: String(CourseTitle.MIN_LENGTH) }
        )
      );
    }

    if (trimmed.length > CourseTitle.MAX_LENGTH) {
      return Result.fail(
        new ValidationError(
          `Title must not exceed ${CourseTitle.MAX_LENGTH} characters`,
          'title',
          { maxLength: String(CourseTitle.MAX_LENGTH) }
        )
      );
    }

    return Result.ok(new CourseTitle({ value: trimmed }));
  }
}
