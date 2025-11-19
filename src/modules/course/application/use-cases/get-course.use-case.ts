/**
 * Get Course Use Case
 */

import { BaseUseCase } from '@/core/shared/use-case.interface';
import { Result } from '@/core/shared/result';
import { EntityNotFoundError } from '@/core/shared/errors';
import type { ICourseRepository } from '../../domain/course.repository.interface';
import { type CourseDTO, courseMapper } from '../../infrastructure/course.mapper';

interface GetCourseRequest {
  courseId?: string;
  slug?: string;
}

export class GetCourseUseCase extends BaseUseCase<
  GetCourseRequest,
  CourseDTO
> {
  constructor(private courseRepository: ICourseRepository) {
    super();
  }

  async execute(request: GetCourseRequest): Promise<Result<CourseDTO>> {
    const { courseId, slug } = request;

    if (!courseId && !slug) {
      return Result.fail(
        new EntityNotFoundError('Course', 'id or slug must be provided')
      );
    }

    // Find course by ID or slug
    const courseResult = slug
      ? await this.courseRepository.findBySlug(slug)
      : await this.courseRepository.findById(courseId!);

    if (courseResult.isFailure) {
      return Result.fail(courseResult.error);
    }

    if (!courseResult.value) {
      return Result.fail(
        new EntityNotFoundError('Course', courseId || slug!)
      );
    }

    // Map to DTO
    const courseDTO = courseMapper.toDTO(courseResult.value);

    return Result.ok(courseDTO);
  }
}
