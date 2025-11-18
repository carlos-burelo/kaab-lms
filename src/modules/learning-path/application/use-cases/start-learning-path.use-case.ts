/**
 * Start Learning Path Use Case
 */

import { BaseUseCase } from '@/core/shared/use-case.interface';
import { Result } from '@/core/shared/result';
import { NotFoundError, BusinessRuleError } from '@/core/shared/errors';
import { ILearningPathRepository } from '../../domain/learning-path.repository.interface';
import { UserLearningPathProgress } from '../../domain/user-learning-path-progress.entity';
import { NodeType } from '../../domain/value-objects/node-type';
import {
  UserLearningPathProgressDTO,
  userLearningPathProgressMapper,
} from '../../infrastructure/learning-path.mapper';

interface StartLearningPathRequest {
  learningPathId: string;
  userId: string;
}

export class StartLearningPathUseCase extends BaseUseCase<
  StartLearningPathRequest,
  UserLearningPathProgressDTO
> {
  constructor(private learningPathRepository: ILearningPathRepository) {
    super();
  }

  async execute(
    request: StartLearningPathRequest
  ): Promise<Result<UserLearningPathProgressDTO>> {
    const { learningPathId, userId } = request;

    // Check if user has already started
    const hasStartedResult = await this.learningPathRepository.hasUserStarted(
      userId,
      learningPathId
    );

    if (hasStartedResult.isFailure) {
      return Result.fail(hasStartedResult.error);
    }

    if (hasStartedResult.value) {
      return Result.fail(
        new BusinessRuleError('User has already started this learning path')
      );
    }

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

    // Check if learning path is published
    if (!learningPath.isPublished) {
      return Result.fail(
        new BusinessRuleError('Learning path is not published')
      );
    }

    // Find START node
    const startNode = learningPath.nodes.find(
      (node) => node.type === NodeType.START
    );

    if (!startNode) {
      return Result.fail(
        new BusinessRuleError('Learning path has no START node')
      );
    }

    // Create progress
    const progressResult = UserLearningPathProgress.create({
      userId,
      learningPathId,
    });

    if (progressResult.isFailure) {
      return Result.fail(progressResult.error);
    }

    const progress = progressResult.value;

    // Start at the START node
    const startResult = progress.startPath(startNode.id);

    if (startResult.isFailure) {
      return Result.fail(startResult.error);
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
