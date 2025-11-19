/**
 * Learning Path Node Entity
 */

import { Entity, type EntityProps } from '@/core/shared/entity';
import { Result } from '@/core/shared/result';
import { ValidationError } from '@/core/shared/errors';
import { NodeType } from './value-objects/node-type';

export interface Position {
  x: number;
  y: number;
}

export interface NodeData {
  [key: string]: unknown;
}

export interface LearningPathNodeProps extends EntityProps {
  learningPathId: string;
  type: NodeType;
  courseId?: string;
  position: Position;
  data?: NodeData;
}

export class LearningPathNode extends Entity<LearningPathNodeProps> {
  get learningPathId(): string {
    return this._props.learningPathId;
  }

  get type(): NodeType {
    return this._props.type;
  }

  get courseId(): string | undefined {
    return this._props.courseId;
  }

  get position(): Position {
    return this._props.position;
  }

  get data(): NodeData | undefined {
    return this._props.data;
  }

  private constructor(props: LearningPathNodeProps, id?: string) {
    super(props, id);
  }

  /**
   * Create a new learning path node
   */
  static create(
    props: Omit<LearningPathNodeProps, 'id' | 'createdAt' | 'updatedAt'>
  ): Result<LearningPathNode, ValidationError> {
    // Validations
    if (!props.learningPathId || props.learningPathId.trim().length === 0) {
      return Result.fail(
        new ValidationError(
          'Learning path ID is required',
          'learningPathId'
        )
      );
    }

    if (!Object.values(NodeType).includes(props.type)) {
      return Result.fail(
        new ValidationError('Invalid node type', 'type')
      );
    }

    // COURSE nodes must have a courseId
    if (props.type === NodeType.COURSE && !props.courseId) {
      return Result.fail(
        new ValidationError(
          'Course nodes must have a courseId',
          'courseId'
        )
      );
    }

    // Non-COURSE nodes should not have a courseId
    if (props.type !== NodeType.COURSE && props.courseId) {
      return Result.fail(
        new ValidationError(
          'Only course nodes can have a courseId',
          'courseId'
        )
      );
    }

    if (!props.position || typeof props.position.x !== 'number' || typeof props.position.y !== 'number') {
      return Result.fail(
        new ValidationError('Valid position is required', 'position')
      );
    }

    const node = new LearningPathNode(props, props.id);

    return Result.ok(node);
  }

  /**
   * Update node position
   */
  updatePosition(position: Position): Result<void, ValidationError> {
    if (typeof position.x !== 'number' || typeof position.y !== 'number') {
      return Result.fail(
        new ValidationError('Valid position is required', 'position')
      );
    }

    this._props.position = position;
    this.touch();

    return Result.ok(undefined);
  }

  /**
   * Update node data
   */
  updateData(data: NodeData): void {
    this._props.data = data;
    this.touch();
  }

  /**
   * Check if node can be completed
   */
  canBeCompleted(): boolean {
    // START and END nodes cannot be "completed" in the traditional sense
    // DECISION and SYNC nodes are completed automatically
    // Only COURSE nodes need explicit completion
    return this._props.type === NodeType.COURSE;
  }

  toObject(): LearningPathNodeProps & {
    id: string;
    createdAt: Date;
    updatedAt: Date;
  } {
    return {
      id: this.id,
      learningPathId: this.learningPathId,
      type: this.type,
      courseId: this.courseId,
      position: this.position,
      data: this.data,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  clone(): LearningPathNode {
    return new LearningPathNode({ ...this._props }, this._id);
  }
}
