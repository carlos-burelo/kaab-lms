/**
 * Publish Course Use Case
 */

import { EntityNotFoundError, ForbiddenError } from '@/core/shared/errors'
import { Result } from '@/core/shared/result'
import { BaseUseCase } from '@/core/shared/use-case.interface'
import type { ICourseRepository } from '../../domain/course.repository.interface'
import { type CourseDTO, courseMapper } from '../../infrastructure/course.mapper'

interface PublishCourseRequest {
  courseId: string
  currentUserId: string
}

export class PublishCourseUseCase extends BaseUseCase<PublishCourseRequest, CourseDTO> {
  constructor(private courseRepository: ICourseRepository) {
    super()
  }

  async execute(request: PublishCourseRequest): Promise<Result<CourseDTO>> {
    const { courseId, currentUserId } = request

    // Find course
    const courseResult = await this.courseRepository.findById(courseId)

    if (courseResult.isFailure) {
      return Result.fail(courseResult.error)
    }

    if (!courseResult.value) {
      return Result.fail(new EntityNotFoundError('Course', courseId))
    }

    const course = courseResult.value

    // Check authorization
    if (!course.canBeEditedBy(currentUserId)) {
      return Result.fail(new ForbiddenError('You do not have permission to publish this course'))
    }

    // Publish course
    const publishResult = course.publish()

    if (publishResult.isFailure) {
      return Result.fail(publishResult.error)
    }

    // Save course
    const savedResult = await this.courseRepository.save(course)

    if (savedResult.isFailure) {
      return Result.fail(savedResult.error)
    }

    // Map to DTO
    const courseDTO = courseMapper.toDTO(savedResult.value)

    return Result.ok(courseDTO)
  }
}
