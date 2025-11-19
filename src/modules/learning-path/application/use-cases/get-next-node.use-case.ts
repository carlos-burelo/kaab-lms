/**
 * Get Next Node Use Case
 */

import { BusinessRuleError, NotFoundError } from '@/core/shared/errors'
import { Result } from '@/core/shared/result'
import { BaseUseCase } from '@/core/shared/use-case.interface'
import type { ILearningPathRepository } from '../../domain/learning-path.repository.interface'
import { NodeType } from '../../domain/value-objects/node-type'
import { type LearningPathNodeDTO, learningPathNodeMapper } from '../../infrastructure/learning-path.mapper'

interface GetNextNodeRequest {
  learningPathId: string
  userId: string
}

export class GetNextNodeUseCase extends BaseUseCase<GetNextNodeRequest, LearningPathNodeDTO | null> {
  constructor(private learningPathRepository: ILearningPathRepository) {
    super()
  }

  async execute(request: GetNextNodeRequest): Promise<Result<LearningPathNodeDTO | null>> {
    const { learningPathId, userId } = request

    // Find learning path with graph
    const learningPathResult = await this.learningPathRepository.findByIdWithGraph(learningPathId)

    if (learningPathResult.isFailure) {
      return Result.fail(learningPathResult.error)
    }

    if (!learningPathResult.value) {
      return Result.fail(new NotFoundError('LearningPath', learningPathId))
    }

    const learningPath = learningPathResult.value

    // Get user progress
    const progressResult = await this.learningPathRepository.getUserProgress(userId, learningPathId)

    if (progressResult.isFailure) {
      return Result.fail(progressResult.error)
    }

    if (!progressResult.value) {
      return Result.fail(new NotFoundError('UserProgress', `${userId}-${learningPathId}`))
    }

    const progress = progressResult.value

    // If learning path is completed, return null
    if (progress.isCompleted) {
      return Result.ok(null)
    }

    // Get current node
    const currentNodeId = progress.currentNodeId

    if (!currentNodeId) {
      return Result.fail(new BusinessRuleError('No current node in progress'))
    }

    const currentNode = learningPath.getNode(currentNodeId)

    if (!currentNode) {
      return Result.fail(new NotFoundError('Node', currentNodeId))
    }

    // If current node is END, learning path should be completed
    if (currentNode.type === NodeType.END) {
      return Result.ok(null)
    }

    // Find outgoing edges from current node
    const outgoingEdges = learningPath.edges.filter((edge) => edge.sourceNodeId === currentNodeId)

    if (outgoingEdges.length === 0) {
      return Result.fail(new BusinessRuleError('No outgoing edges from current node'))
    }

    // For simplicity, take the first edge
    // In a real implementation, you would evaluate conditions
    const nextEdge = outgoingEdges[0]
    const nextNode = learningPath.getNode(nextEdge.targetNodeId)

    if (!nextNode) {
      return Result.fail(new NotFoundError('Node', nextEdge.targetNodeId))
    }

    // Update progress to next node
    const moveResult = progress.moveToNode(nextNode.id)

    if (moveResult.isFailure) {
      return Result.fail(moveResult.error)
    }

    // Save progress
    const savedResult = await this.learningPathRepository.saveUserProgress(progress)

    if (savedResult.isFailure) {
      return Result.fail(savedResult.error)
    }

    // Map node to DTO
    const nodeDTO = learningPathNodeMapper.toDTO(nextNode)

    return Result.ok(nodeDTO)
  }
}
