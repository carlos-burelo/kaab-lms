/**
 * Create Learning Path Use Case
 */

import { Result } from '@/core/shared/result'
import { BaseUseCase } from '@/core/shared/use-case.interface'
import { LearningPath } from '../../domain/learning-path.entity'
import type { ILearningPathRepository } from '../../domain/learning-path.repository.interface'
import { type LearningPathDTO, learningPathMapper } from '../../infrastructure/learning-path.mapper'
import type { CreateLearningPathDTO } from '../dtos'

interface CreateLearningPathRequest {
  dto: CreateLearningPathDTO
  currentUserId: string
}

export class CreateLearningPathUseCase extends BaseUseCase<CreateLearningPathRequest, LearningPathDTO> {
  constructor(private learningPathRepository: ILearningPathRepository) {
    super()
  }

  async execute(request: CreateLearningPathRequest): Promise<Result<LearningPathDTO>> {
    const { dto } = request

    // Create learning path entity
    const learningPathResult = LearningPath.create({
      title: dto.title,
      description: dto.description,
      createdBy: dto.createdBy
    })

    if (learningPathResult.isFailure) {
      return Result.fail(learningPathResult.error)
    }

    // Save to repository
    const savedResult = await this.learningPathRepository.save(learningPathResult.value)

    if (savedResult.isFailure) {
      return Result.fail(savedResult.error)
    }

    // Map to DTO
    const learningPathDTO = learningPathMapper.toDTO(savedResult.value)

    return Result.ok(learningPathDTO)
  }
}
