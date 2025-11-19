/**
 * Add Node Use Case
 */

import { NotFoundError } from '@/core/shared/errors'
import { Result } from '@/core/shared/result'
import { BaseUseCase } from '@/core/shared/use-case.interface'
import type { ILearningPathRepository } from '../../domain/learning-path.repository.interface'
import { LearningPathNode } from '../../domain/learning-path-node.entity'
import { type LearningPathNodeDTO, learningPathNodeMapper } from '../../infrastructure/learning-path.mapper'
import type { AddNodeDTO } from '../dtos'

interface AddNodeRequest {
  dto: AddNodeDTO
  currentUserId: string
}

export class AddNodeUseCase extends BaseUseCase<AddNodeRequest, LearningPathNodeDTO> {
  constructor(private learningPathRepository: ILearningPathRepository) {
    super()
  }

  async execute(request: AddNodeRequest): Promise<Result<LearningPathNodeDTO>> {
    const { dto } = request

    // Find learning path
    const learningPathResult = await this.learningPathRepository.findById(dto.learningPathId)

    if (learningPathResult.isFailure) {
      return Result.fail(learningPathResult.error)
    }

    if (!learningPathResult.value) {
      return Result.fail(new NotFoundError('LearningPath', dto.learningPathId))
    }

    const learningPath = learningPathResult.value

    // Create node entity
    const nodeResult = LearningPathNode.create({
      learningPathId: dto.learningPathId,
      type: dto.type,
      courseId: dto.courseId,
      position: dto.position,
      data: dto.data
    })

    if (nodeResult.isFailure) {
      return Result.fail(nodeResult.error)
    }

    // Add node to learning path
    const addNodeResult = learningPath.addNode(nodeResult.value)

    if (addNodeResult.isFailure) {
      return Result.fail(addNodeResult.error)
    }

    // Save learning path
    const savedResult = await this.learningPathRepository.save(learningPath)

    if (savedResult.isFailure) {
      return Result.fail(savedResult.error)
    }

    // Map node to DTO
    const nodeDTO = learningPathNodeMapper.toDTO(nodeResult.value)

    return Result.ok(nodeDTO)
  }
}
