/**
 * Update Progress Use Case
 */

import { NotFoundError } from '@/core/shared/errors'
import { Result } from '@/core/shared/result'
import { BaseUseCase } from '@/core/shared/use-case.interface'
import type { IEnrollmentRepository } from '../../domain/enrollment.repository.interface'
import { type EnrollmentDTO, enrollmentMapper } from '../../infrastructure/enrollment.mapper'
import type { UpdateProgressDTO } from '../dtos'

interface UpdateProgressRequest {
  dto: UpdateProgressDTO
  currentUserId: string
}

export class UpdateProgressUseCase extends BaseUseCase<UpdateProgressRequest, EnrollmentDTO> {
  constructor(private enrollmentRepository: IEnrollmentRepository) {
    super()
  }

  async execute(request: UpdateProgressRequest): Promise<Result<EnrollmentDTO>> {
    const { dto } = request

    // Find enrollment
    const enrollmentResult = await this.enrollmentRepository.findById(dto.enrollmentId)

    if (enrollmentResult.isFailure) {
      return Result.fail(enrollmentResult.error)
    }

    if (!enrollmentResult.value) {
      return Result.fail(new NotFoundError('Enrollment', 'id', dto.enrollmentId))
    }

    const enrollment = enrollmentResult.value

    // Update progress
    const updateResult = enrollment.updateProgress(dto.completedLessons, dto.totalLessons)

    if (updateResult.isFailure) {
      return Result.fail(updateResult.error)
    }

    // Update last lesson if provided
    if (dto.lastLessonId && dto.timeSpentMinutes !== undefined) {
      const completeLessonResult = enrollment.completeLesson(dto.lastLessonId, dto.timeSpentMinutes)

      if (completeLessonResult.isFailure) {
        return Result.fail(completeLessonResult.error)
      }
    }

    // Save to repository
    const savedResult = await this.enrollmentRepository.save(enrollment)

    if (savedResult.isFailure) {
      return Result.fail(savedResult.error)
    }

    // Map to DTO
    const enrollmentDTO = enrollmentMapper.toDTO(savedResult.value)

    return Result.ok(enrollmentDTO)
  }
}
