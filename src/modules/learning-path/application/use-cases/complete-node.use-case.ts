/**
 * Complete Node Use Case
 */

import { BaseUseCase } from '@/core/shared/use-case.interface';
import { Result } from '@/core/shared/result';
import { NotFoundError } from '@/core/shared/errors';
import type { ILearningPathRepository } from '../../domain/learning-path.repository.interface';
import { NodeType } from '../../domain/value-objects/node-type';
import { NodeCompletedEvent, LearningPathCompletedEvent } from '../../domain/events';
import {
  type UserLearningPathProgressDTO,
  userLearningPathProgressMapper,
} from '../../infrastructure/learning-path.mapper';

interface CompleteNodeRequest {
  learningPathId: string;
  nodeId: string;
  userId: string;
}

export class CompleteNodeUseCase extends BaseUseCase<
  CompleteNodeRequest,
  UserLearningPathProgressDTO
> {
  constructor(private learningPathRepository: ILearningPathRepository) {
    super();
  }

  async execute(
    request: CompleteNodeRequest
  ): Promise<Result<UserLearningPathProgressDTO>> {
    const { learningPathId, nodeId, userId } = request;

    // Find learning path with graph
    const learningPathResult =
      await this.learningPathRepository.findByIdWithGraph(learningPathId);

    if (learningPathResult.isFailure) {
      return Result.fail(learningPathResult.error);
    }

    if (!learningPathResult.value) {
      return Result.fail(new NotFoundError('LearningPath', learningPathId));
    }

    const learningPath = learningPathResult.value;

    // Find node
    const node = learningPath.getNode(nodeId);

    if (!node) {
      return Result.fail(new NotFoundError('Node', nodeId));
    }

    // Get user progress
    const progressResult = await this.learningPathRepository.getUserProgress(
      userId,
      learningPathId
    );

    if (progressResult.isFailure) {
      return Result.fail(progressResult.error);
    }

    if (!progressResult.value) {
      return Result.fail(
        new NotFoundError('UserProgress', `${userId}-${learningPathId}`)
      );
    }

    const progress = progressResult.value;

    // Complete the node
    const completeResult = progress.completeNode(nodeId);

    if (completeResult.isFailure) {
      return Result.fail(completeResult.error);
    }

    // Check if this is an END node
    if (node.type === NodeType.END) {
      const completePathResult = progress.completePath();
      if (completePathResult.isFailure) {
        return Result.fail(completePathResult.error);
      }
    }

    // Save progress
    const savedResult = await this.learningPathRepository.saveUserProgress(
      progress
    );

    if (savedResult.isFailure) {
      return Result.fail(savedResult.error);
    }

    // Map to DTO
    const progressDTO = userLearningPathProgressMapper.toDTO(savedResult.value);

    return Result.ok(progressDTO);
  }
}
