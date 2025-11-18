/**
 * Get Enrollment Use Case
 */

import { BaseUseCase } from '@/core/shared/use-case.interface';
import { Result } from '@/core/shared/result';
import { NotFoundError } from '@/core/shared/errors';
import { IEnrollmentRepository } from '../../domain/enrollment.repository.interface';
import {
  EnrollmentDTO,
  enrollmentMapper,
} from '../../infrastructure/enrollment.mapper';

interface GetEnrollmentRequest {
  enrollmentId?: string;
  userId?: string;
  courseId?: string;
  currentUserId: string;
}

export class GetEnrollmentUseCase extends BaseUseCase<
  GetEnrollmentRequest,
  EnrollmentDTO
> {
  constructor(private enrollmentRepository: IEnrollmentRepository) {
    super();
  }

  async execute(
    request: GetEnrollmentRequest
  ): Promise<Result<EnrollmentDTO>> {
    const { enrollmentId, userId, courseId } = request;

    let enrollmentResult;

    // Find by ID or by user-course combination
    if (enrollmentId) {
      enrollmentResult = await this.enrollmentRepository.findById(enrollmentId);
    } else if (userId && courseId) {
      enrollmentResult = await this.enrollmentRepository.findByUserAndCourse(
        userId,
        courseId
      );
    } else {
      return Result.fail(
        new NotFoundError(
          'Enrollment',
          'query',
          'Either enrollmentId or userId+courseId must be provided'
        )
      );
    }

    if (enrollmentResult.isFailure) {
      return Result.fail(enrollmentResult.error);
    }

    if (!enrollmentResult.value) {
      return Result.fail(
        new NotFoundError(
          'Enrollment',
          enrollmentId ? 'id' : 'userId-courseId',
          enrollmentId || `${userId}-${courseId}`
        )
      );
    }

    // Map to DTO
    const enrollmentDTO = enrollmentMapper.toDTO(enrollmentResult.value);

    return Result.ok(enrollmentDTO);
  }
}
