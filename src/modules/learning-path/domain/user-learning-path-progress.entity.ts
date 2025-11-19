/**
 * User Learning Path Progress Entity
 */

import { Entity, type EntityProps } from '@/core/shared/entity';
import { Result } from '@/core/shared/result';
import { ValidationError, BusinessRuleError } from '@/core/shared/errors';

export interface UserLearningPathProgressProps extends EntityProps {
  userId: string;
  learningPathId: string;
  currentNodeId?: string;
  completedNodes: string[];
  isCompleted: boolean;
  completedAt?: Date;
}

export class UserLearningPathProgress extends Entity<UserLearningPathProgressProps> {
  get userId(): string {
    return this._props.userId;
  }

  get learningPathId(): string {
    return this._props.learningPathId;
  }

  get currentNodeId(): string | undefined {
    return this._props.currentNodeId;
  }

  get completedNodes(): string[] {
    return [...this._props.completedNodes];
  }

  get isCompleted(): boolean {
    return this._props.isCompleted;
  }

  get completedAt(): Date | undefined {
    return this._props.completedAt;
  }

  private constructor(props: UserLearningPathProgressProps, id?: string) {
    super(props, id);
  }

  /**
   * Create new progress
   */
  static create(
    props: Omit<
      UserLearningPathProgressProps,
      'id' | 'completedNodes' | 'isCompleted' | 'createdAt' | 'updatedAt'
    >
  ): Result<UserLearningPathProgress, ValidationError> {
    // Validations
    if (!props.userId || props.userId.trim().length === 0) {
      return Result.fail(
        new ValidationError('User ID is required', 'userId')
      );
    }

    if (!props.learningPathId || props.learningPathId.trim().length === 0) {
      return Result.fail(
        new ValidationError(
          'Learning path ID is required',
          'learningPathId'
        )
      );
    }

    const progress = new UserLearningPathProgress(
      {
        ...props,
        completedNodes: [],
        isCompleted: false,
      },
      props.id
    );

    return Result.ok(progress);
  }

  /**
   * Start the learning path
   */
  startPath(startNodeId: string): Result<void, ValidationError> {
    if (!startNodeId || startNodeId.trim().length === 0) {
      return Result.fail(
        new ValidationError('Start node ID is required', 'startNodeId')
      );
    }

    this._props.currentNodeId = startNodeId;
    this.touch();

    return Result.ok(undefined);
  }

  /**
   * Complete a node
   */
  completeNode(nodeId: string): Result<void, BusinessRuleError> {
    if (this._props.isCompleted) {
      return Result.fail(
        new BusinessRuleError('Learning path is already completed')
      );
    }

    if (this._props.completedNodes.includes(nodeId)) {
      return Result.fail(
        new BusinessRuleError('Node is already completed')
      );
    }

    this._props.completedNodes.push(nodeId);
    this.touch();

    return Result.ok(undefined);
  }

  /**
   * Move to next node
   */
  moveToNode(nextNodeId: string): Result<void, ValidationError> {
    if (!nextNodeId || nextNodeId.trim().length === 0) {
      return Result.fail(
        new ValidationError('Next node ID is required', 'nextNodeId')
      );
    }

    this._props.currentNodeId = nextNodeId;
    this.touch();

    return Result.ok(undefined);
  }

  /**
   * Mark learning path as completed
   */
  completePath(): Result<void, BusinessRuleError> {
    if (this._props.isCompleted) {
      return Result.fail(
        new BusinessRuleError('Learning path is already completed')
      );
    }

    this._props.isCompleted = true;
    this._props.completedAt = new Date();
    this.touch();

    return Result.ok(undefined);
  }

  /**
   * Calculate progress percentage
   */
  calculateProgress(totalNodes: number): number {
    if (totalNodes === 0) {
      return 0;
    }

    return Math.round(
      (this._props.completedNodes.length / totalNodes) * 100
    );
  }

  /**
   * Check if a node is completed
   */
  isNodeCompleted(nodeId: string): boolean {
    return this._props.completedNodes.includes(nodeId);
  }

  /**
   * Get next node (placeholder - actual logic would be in use case)
   */
  getNextNode(): string | undefined {
    return this._props.currentNodeId;
  }

  toObject(): UserLearningPathProgressProps & {
    id: string;
    createdAt: Date;
    updatedAt: Date;
  } {
    return {
      id: this.id,
      userId: this.userId,
      learningPathId: this.learningPathId,
      currentNodeId: this.currentNodeId,
      completedNodes: this.completedNodes,
      isCompleted: this.isCompleted,
      completedAt: this.completedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  clone(): UserLearningPathProgress {
    return new UserLearningPathProgress({ ...this._props }, this._id);
  }
}
