/**
 * Learning Path Edge Entity
 */

import { Entity, EntityProps } from '@/core/shared/entity';
import { Result } from '@/core/shared/result';
import { ValidationError } from '@/core/shared/errors';

export interface EdgeCondition {
  [key: string]: unknown;
}

export interface LearningPathEdgeProps extends EntityProps {
  learningPathId: string;
  sourceNodeId: string;
  targetNodeId: string;
  condition?: EdgeCondition;
}

export class LearningPathEdge extends Entity<LearningPathEdgeProps> {
  get learningPathId(): string {
    return this._props.learningPathId;
  }

  get sourceNodeId(): string {
    return this._props.sourceNodeId;
  }

  get targetNodeId(): string {
    return this._props.targetNodeId;
  }

  get condition(): EdgeCondition | undefined {
    return this._props.condition;
  }

  private constructor(props: LearningPathEdgeProps, id?: string) {
    super(props, id);
  }

  /**
   * Create a new learning path edge
   */
  static create(
    props: Omit<LearningPathEdgeProps, 'id' | 'createdAt' | 'updatedAt'>
  ): Result<LearningPathEdge, ValidationError> {
    // Validations
    if (!props.learningPathId || props.learningPathId.trim().length === 0) {
      return Result.fail(
        new ValidationError(
          'Learning path ID is required',
          'learningPathId'
        )
      );
    }

    if (!props.sourceNodeId || props.sourceNodeId.trim().length === 0) {
      return Result.fail(
        new ValidationError('Source node ID is required', 'sourceNodeId')
      );
    }

    if (!props.targetNodeId || props.targetNodeId.trim().length === 0) {
      return Result.fail(
        new ValidationError('Target node ID is required', 'targetNodeId')
      );
    }

    // Prevent self-loops
    if (props.sourceNodeId === props.targetNodeId) {
      return Result.fail(
        new ValidationError(
          'Source and target nodes cannot be the same',
          'targetNodeId'
        )
      );
    }

    const edge = new LearningPathEdge(props, props.id);

    return Result.ok(edge);
  }

  /**
   * Update edge condition
   */
  updateCondition(condition: EdgeCondition): void {
    this._props.condition = condition;
    this.touch();
  }

  /**
   * Remove edge condition
   */
  removeCondition(): void {
    this._props.condition = undefined;
    this.touch();
  }

  /**
   * Check if edge has a condition
   */
  hasCondition(): boolean {
    return this._props.condition !== undefined;
  }

  toObject(): LearningPathEdgeProps & {
    id: string;
    createdAt: Date;
    updatedAt: Date;
  } {
    return {
      id: this.id,
      learningPathId: this.learningPathId,
      sourceNodeId: this.sourceNodeId,
      targetNodeId: this.targetNodeId,
      condition: this.condition,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  clone(): LearningPathEdge {
    return new LearningPathEdge({ ...this._props }, this._id);
  }
}
