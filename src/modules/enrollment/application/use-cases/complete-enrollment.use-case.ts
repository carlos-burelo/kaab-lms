/**
 * Complete Enrollment Use Case
 */

import { NotFoundError } from '@/core/shared/errors'
import { Result } from '@/core/shared/result'
import { BaseUseCase } from '@/core/shared/use-case.interface'
import type { IEnrollmentRepository } from '../../domain/enrollment.repository.interface'
import { type EnrollmentDTO, enrollmentMapper } from '../../infrastructure/enrollment.mapper'

interface CompleteEnrollmentRequest {
  enrollmentId: string
  currentUserId: string
}

export class CompleteEnrollmentUseCase extends BaseUseCase<CompleteEnrollmentRequest, EnrollmentDTO> {
  constructor(private enrollmentRepository: IEnrollmentRepository) {
    super()
  }

  async execute(request: CompleteEnrollmentRequest): Promise<Result<EnrollmentDTO>> {
    const { enrollmentId } = request

    // Find enrollment
    const enrollmentResult = await this.enrollmentRepository.findById(enrollmentId)

    if (enrollmentResult.isFailure) {
      return Result.fail(enrollmentResult.error)
    }

    if (!enrollmentResult.value) {
      return Result.fail(new NotFoundError('Enrollment', 'id', enrollmentId))
    }

    const enrollment = enrollmentResult.value

    // Complete enrollment
    const completeResult = enrollment.complete()

    if (completeResult.isFailure) {
      return Result.fail(completeResult.error)
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
