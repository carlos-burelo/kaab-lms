/**
 * Enroll Student Use Case
 */

import { DuplicateEntityError } from '@/core/shared/errors'
import { Result } from '@/core/shared/result'
import { BaseUseCase } from '@/core/shared/use-case.interface'
import { Enrollment } from '../../domain/enrollment.entity'
import type { IEnrollmentRepository } from '../../domain/enrollment.repository.interface'
import { type EnrollmentDTO, enrollmentMapper } from '../../infrastructure/enrollment.mapper'
import type { EnrollStudentDTO } from '../dtos'

interface EnrollStudentRequest {
  dto: EnrollStudentDTO
  currentUserId: string
}

export class EnrollStudentUseCase extends BaseUseCase<EnrollStudentRequest, EnrollmentDTO> {
  constructor(private enrollmentRepository: IEnrollmentRepository) {
    super()
  }

  async execute(request: EnrollStudentRequest): Promise<Result<EnrollmentDTO>> {
    const { dto } = request

    // Check if user is already enrolled
    const isEnrolledResult = await this.enrollmentRepository.isUserEnrolled(dto.userId, dto.courseId)

    if (isEnrolledResult.isFailure) {
      return Result.fail(isEnrolledResult.error)
    }

    if (isEnrolledResult.value) {
      return Result.fail(new DuplicateEntityError('Enrollment', 'userId-courseId', `${dto.userId}-${dto.courseId}`))
    }

    // Create enrollment entity
    const enrollmentResult = Enrollment.create({
      userId: dto.userId,
      courseId: dto.courseId
    })

    if (enrollmentResult.isFailure) {
      return Result.fail(enrollmentResult.error)
    }

    // Save to repository
    const savedResult = await this.enrollmentRepository.save(enrollmentResult.value)

    if (savedResult.isFailure) {
      return Result.fail(savedResult.error)
    }

    // Map to DTO
    const enrollmentDTO = enrollmentMapper.toDTO(savedResult.value)

    return Result.ok(enrollmentDTO)
  }
}
