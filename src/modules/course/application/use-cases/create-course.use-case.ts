/**
 * Create Course Use Case
 */

import { BaseUseCase } from '@/core/shared/use-case.interface';
import { Result } from '@/core/shared/result';
import {
  ForbiddenError,
  DuplicateEntityError,
} from '@/core/shared/errors';
import { Course, type CourseLevel } from '../../domain/course.entity';
import { CourseTitle, CoursePrice, CourseSlug } from '../../domain/value-objects';
import type { ICourseRepository } from '../../domain/course.repository.interface';
import type { CreateCourseDTO } from '../dtos';
import { type CourseDTO, courseMapper } from '../../infrastructure/course.mapper';

interface CreateCourseRequest {
  dto: CreateCourseDTO;
  currentUserId: string;
}

export class CreateCourseUseCase extends BaseUseCase<
  CreateCourseRequest,
  CourseDTO
> {
  constructor(private courseRepository: ICourseRepository) {
    super();
  }

  async execute(
    request: CreateCourseRequest
  ): Promise<Result<CourseDTO>> {
    const { dto, currentUserId } = request;

    // Validate authorization
    if (dto.instructorId !== currentUserId) {
      return Result.fail(
        new ForbiddenError('You can only create courses for yourself')
      );
    }

    // Create value objects
    const titleResult = CourseTitle.create(dto.title);
    if (titleResult.isFailure) {
      return Result.fail(titleResult.error);
    }

    const slug = CourseSlug.fromTitle(dto.title);

    // Check if slug already exists
    const slugExistsResult = await this.courseRepository.slugExists(
      slug.value
    );
    if (slugExistsResult.isFailure) {
      return Result.fail(slugExistsResult.error);
    }

    if (slugExistsResult.value) {
      return Result.fail(
        new DuplicateEntityError('Course', 'slug', slug.value)
      );
    }

    // Create price if provided
    let price: CoursePrice | undefined;
    if (dto.price !== undefined) {
      const priceResult = CoursePrice.create(dto.price);
      if (priceResult.isFailure) {
        return Result.fail(priceResult.error);
      }
      price = priceResult.value;
    }

    // Create course entity
    const courseResult = Course.create({
      instructorId: dto.instructorId,
      title: titleResult.value,
      slug,
      description: dto.description,
      imageId: dto.imageId,
      price,
      level: dto.level as CourseLevel,
      categoryId: dto.categoryId,
      requirements: dto.requirements,
      objectives: dto.objectives,
    });

    if (courseResult.isFailure) {
      return Result.fail(courseResult.error);
    }

    // Save to repository
    const savedResult = await this.courseRepository.save(
      courseResult.value
    );

    if (savedResult.isFailure) {
      return Result.fail(savedResult.error);
    }

    // Map to DTO
    const courseDTO = courseMapper.toDTO(savedResult.value);

    return Result.ok(courseDTO);
  }
}
