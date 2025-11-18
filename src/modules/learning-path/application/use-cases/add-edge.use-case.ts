/**
 * Add Edge Use Case
 */

import { BaseUseCase } from '@/core/shared/use-case.interface';
import { Result } from '@/core/shared/result';
import { NotFoundError } from '@/core/shared/errors';
import { ILearningPathRepository } from '../../domain/learning-path.repository.interface';
import { LearningPathEdge } from '../../domain/learning-path-edge.entity';
import { AddEdgeDTO } from '../dtos';
import {
  LearningPathEdgeDTO,
  learningPathEdgeMapper,
} from '../../infrastructure/learning-path.mapper';

interface AddEdgeRequest {
  dto: AddEdgeDTO;
  currentUserId: string;
}

export class AddEdgeUseCase extends BaseUseCase<
  AddEdgeRequest,
  LearningPathEdgeDTO
> {
  constructor(private learningPathRepository: ILearningPathRepository) {
    super();
  }

  async execute(request: AddEdgeRequest): Promise<Result<LearningPathEdgeDTO>> {
    const { dto } = request;

    // Find learning path with graph
    const learningPathResult =
      await this.learningPathRepository.findByIdWithGraph(dto.learningPathId);

    if (learningPathResult.isFailure) {
      return Result.fail(learningPathResult.error);
    }

    if (!learningPathResult.value) {
      return Result.fail(
        new NotFoundError('LearningPath', dto.learningPathId)
      );
    }

    const learningPath = learningPathResult.value;

    // Create edge entity
    const edgeResult = LearningPathEdge.create({
      learningPathId: dto.learningPathId,
      sourceNodeId: dto.sourceNodeId,
      targetNodeId: dto.targetNodeId,
      condition: dto.condition,
    });

    if (edgeResult.isFailure) {
      return Result.fail(edgeResult.error);
    }

    // Add edge to learning path
    const addEdgeResult = learningPath.addEdge(edgeResult.value);

    if (addEdgeResult.isFailure) {
      return Result.fail(addEdgeResult.error);
    }

    // Save learning path
    const savedResult = await this.learningPathRepository.save(learningPath);

    if (savedResult.isFailure) {
      return Result.fail(savedResult.error);
    }

    // Map edge to DTO
    const edgeDTO = learningPathEdgeMapper.toDTO(edgeResult.value);

    return Result.ok(edgeDTO);
  }
}
