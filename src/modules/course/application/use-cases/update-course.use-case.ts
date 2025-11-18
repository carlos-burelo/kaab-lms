/**
 * Update Course Use Case
 */

import { BaseUseCase } from '@/core/shared/use-case.interface';
import { Result } from '@/core/shared/result';
import {
  EntityNotFoundError,
  ForbiddenError,
} from '@/core/shared/errors';
import { CourseLevel } from '../../domain/course.entity';
import { CourseTitle, CoursePrice } from '../../domain/value-objects';
import { ICourseRepository } from '../../domain/course.repository.interface';
import { UpdateCourseDTO } from '../dtos';
import { CourseDTO, courseMapper } from '../../infrastructure/course.mapper';

interface UpdateCourseRequest {
  dto: UpdateCourseDTO;
  currentUserId: string;
}

export class UpdateCourseUseCase extends BaseUseCase<
  UpdateCourseRequest,
  CourseDTO
> {
  constructor(private courseRepository: ICourseRepository) {
    super();
  }

  async execute(
    request: UpdateCourseRequest
  ): Promise<Result<CourseDTO>> {
    const { dto, currentUserId } = request;

    // Find course
    const courseResult = await this.courseRepository.findById(dto.courseId);

    if (courseResult.isFailure) {
      return Result.fail(courseResult.error);
    }

    if (!courseResult.value) {
      return Result.fail(
        new EntityNotFoundError('Course', dto.courseId)
      );
    }

    const course = courseResult.value;

    // Check authorization
    if (!course.canBeEditedBy(currentUserId)) {
      return Result.fail(
        new ForbiddenError('You do not have permission to update this course')
      );
    }

    // Update title
    if (dto.title) {
      const titleResult = CourseTitle.create(dto.title);
      if (titleResult.isFailure) {
        return Result.fail(titleResult.error);
      }
      const updateTitleResult = course.updateTitle(titleResult.value);
      if (updateTitleResult.isFailure) {
        return Result.fail(updateTitleResult.error);
      }
    }

    // Update description
    if (dto.description !== undefined) {
      const updateDescResult = course.updateDescription(dto.description);
      if (updateDescResult.isFailure) {
        return Result.fail(updateDescResult.error);
      }
    }

    // Update price
    if (dto.price !== undefined) {
      const priceResult = CoursePrice.create(dto.price);
      if (priceResult.isFailure) {
        return Result.fail(priceResult.error);
      }
      const updatePriceResult = course.updatePrice(priceResult.value);
      if (updatePriceResult.isFailure) {
        return Result.fail(updatePriceResult.error);
      }
    }

    // Update discount price
    if (dto.discountPrice !== undefined) {
      const discountPriceResult = CoursePrice.create(dto.discountPrice);
      if (discountPriceResult.isFailure) {
        return Result.fail(discountPriceResult.error);
      }
      const applyDiscountResult = course.applyDiscount(
        discountPriceResult.value
      );
      if (applyDiscountResult.isFailure) {
        return Result.fail(applyDiscountResult.error);
      }
    }

    // Update image
    if (dto.imageId) {
      course.updateImage(dto.imageId);
    }

    // Update level
    if (dto.level) {
      course.updateLevel(dto.level as CourseLevel);
    }

    // Update category
    if (dto.categoryId) {
      course.updateCategory(dto.categoryId);
    }

    // Update duration
    if (dto.durationMinutes !== undefined) {
      const updateDurationResult = course.setDuration(dto.durationMinutes);
      if (updateDurationResult.isFailure) {
        return Result.fail(updateDurationResult.error);
      }
    }

    // Update requirements
    if (dto.requirements) {
      course.setRequirements(dto.requirements);
    }

    // Update objectives
    if (dto.objectives) {
      course.setObjectives(dto.objectives);
    }

    // Save course
    const savedResult = await this.courseRepository.save(course);

    if (savedResult.isFailure) {
      return Result.fail(savedResult.error);
    }

    // Map to DTO
    const courseDTO = courseMapper.toDTO(savedResult.value);

    return Result.ok(courseDTO);
  }
}
