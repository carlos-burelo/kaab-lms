/**
 * Course Slug Value Object
 */

import { ValueObject } from '@/core/shared/value-object';
import { ValidationError } from '@/core/shared/errors';
import { Result } from '@/core/shared/result';

interface CourseSlugProps {
  value: string;
}

export class CourseSlug extends ValueObject<CourseSlugProps> {
  private static readonly SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  private static readonly MAX_LENGTH = 200;

  get value(): string {
    return this.props.value;
  }

  private constructor(props: CourseSlugProps) {
    super(props);
  }

  static create(slug: string): Result<CourseSlug, ValidationError> {
    const normalized = slug.toLowerCase().trim();

    if (!CourseSlug.SLUG_REGEX.test(normalized)) {
      return Result.fail(
        new ValidationError(
          'Slug must contain only lowercase letters, numbers, and hyphens',
          'slug',
          { pattern: CourseSlug.SLUG_REGEX.source }
        )
      );
    }

    if (normalized.length > CourseSlug.MAX_LENGTH) {
      return Result.fail(
        new ValidationError(
          `Slug must not exceed ${CourseSlug.MAX_LENGTH} characters`,
          'slug',
          { maxLength: String(CourseSlug.MAX_LENGTH) }
        )
      );
    }

    return Result.ok(new CourseSlug({ value: normalized }));
  }

  /**
   * Generate slug from title
   */
  static fromTitle(title: string): CourseSlug {
    const slug = title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens

    // If slug creation fails, use fallback
    const result = CourseSlug.create(slug);
    if (result.isSuccess) {
      return result.value;
    }

    // Fallback: use timestamp
    return new CourseSlug({
      value: `course-${Date.now()}`,
    });
  }
}
