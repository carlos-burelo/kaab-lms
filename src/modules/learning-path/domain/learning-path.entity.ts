/**
 * Learning Path Aggregate Root
 */

import { AggregateRoot, EntityProps } from '@/core/shared/aggregate-root';
import { Result } from '@/core/shared/result';
import { BusinessRuleError, ValidationError } from '@/core/shared/errors';
import {
  LearningPathCreatedEvent,
  LearningPathPublishedEvent,
} from './events';
import { LearningPathNode } from './learning-path-node.entity';
import { LearningPathEdge } from './learning-path-edge.entity';

export interface LearningPathProps extends EntityProps {
  title: string;
  description?: string;
  isPublished: boolean;
  createdBy: string;
  nodes?: LearningPathNode[];
  edges?: LearningPathEdge[];
}

export class LearningPath extends AggregateRoot<LearningPathProps> {
  get title(): string {
    return this._props.title;
  }

  get description(): string | undefined {
    return this._props.description;
  }

  get isPublished(): boolean {
    return this._props.isPublished;
  }

  get createdBy(): string {
    return this._props.createdBy;
  }

  get nodes(): LearningPathNode[] {
    return this._props.nodes || [];
  }

  get edges(): LearningPathEdge[] {
    return this._props.edges || [];
  }

  private constructor(props: LearningPathProps, id?: string) {
    super(props, id);
  }

  /**
   * Create a new learning path
   */
  static create(
    props: Omit<
      LearningPathProps,
      'id' | 'isPublished' | 'nodes' | 'edges' | 'createdAt' | 'updatedAt'
    >
  ): Result<LearningPath, ValidationError> {
    // Validations
    if (props.title.trim().length < 3) {
      return Result.fail(
        new ValidationError('Title must be at least 3 characters', 'title')
      );
    }

    if (!props.createdBy || props.createdBy.trim().length === 0) {
      return Result.fail(
        new ValidationError('Creator ID is required', 'createdBy')
      );
    }

    const learningPath = new LearningPath(
      {
        ...props,
        isPublished: false,
        nodes: [],
        edges: [],
      },
      props.id
    );

    // Emit domain event
    learningPath.addDomainEvent(
      new LearningPathCreatedEvent({
        learningPathId: learningPath.id,
        title: learningPath.title,
        createdBy: learningPath.createdBy,
      })
    );

    return Result.ok(learningPath);
  }

  /**
   * Update learning path title
   */
  updateTitle(newTitle: string): Result<void, ValidationError> {
    if (newTitle.trim().length < 3) {
      return Result.fail(
        new ValidationError('Title must be at least 3 characters', 'title')
      );
    }

    this._props.title = newTitle;
    this.touch();

    return Result.ok(undefined);
  }

  /**
   * Update learning path description
   */
  updateDescription(description: string): void {
    this._props.description = description;
    this.touch();
  }

  /**
   * Publish learning path
   */
  publish(): Result<void, BusinessRuleError> {
    if (this._props.isPublished) {
      return Result.fail(
        new BusinessRuleError('Learning path is already published')
      );
    }

    // Validate that the learning path has at least one START node
    const hasStartNode = this.nodes.some(
      (node) => node.type === 'START'
    );

    if (!hasStartNode) {
      return Result.fail(
        new BusinessRuleError(
          'Learning path must have a START node before publishing'
        )
      );
    }

    // Validate that the learning path has at least one END node
    const hasEndNode = this.nodes.some(
      (node) => node.type === 'END'
    );

    if (!hasEndNode) {
      return Result.fail(
        new BusinessRuleError(
          'Learning path must have an END node before publishing'
        )
      );
    }

    this._props.isPublished = true;
    this.touch();

    // Emit domain event
    this.addDomainEvent(
      new LearningPathPublishedEvent({
        learningPathId: this.id,
        title: this.title,
        createdBy: this.createdBy,
      })
    );

    return Result.ok(undefined);
  }

  /**
   * Unpublish learning path
   */
  unpublish(): Result<void, BusinessRuleError> {
    if (!this._props.isPublished) {
      return Result.fail(
        new BusinessRuleError('Learning path is not published')
      );
    }

    this._props.isPublished = false;
    this.touch();

    return Result.ok(undefined);
  }

  /**
   * Add a node to the learning path
   */
  addNode(node: LearningPathNode): Result<void, BusinessRuleError> {
    if (!this._props.nodes) {
      this._props.nodes = [];
    }

    // Check if node already exists
    const nodeExists = this._props.nodes.some((n) => n.id === node.id);
    if (nodeExists) {
      return Result.fail(
        new BusinessRuleError('Node already exists in learning path')
      );
    }

    this._props.nodes.push(node);
    this.touch();

    return Result.ok(undefined);
  }

  /**
   * Remove a node from the learning path
   */
  removeNode(nodeId: string): Result<void, BusinessRuleError> {
    if (!this._props.nodes) {
      this._props.nodes = [];
    }

    const nodeIndex = this._props.nodes.findIndex((n) => n.id === nodeId);
    if (nodeIndex === -1) {
      return Result.fail(
        new BusinessRuleError('Node not found in learning path')
      );
    }

    // Remove all edges connected to this node
    if (this._props.edges) {
      this._props.edges = this._props.edges.filter(
        (edge) =>
          edge.sourceNodeId !== nodeId && edge.targetNodeId !== nodeId
      );
    }

    this._props.nodes.splice(nodeIndex, 1);
    this.touch();

    return Result.ok(undefined);
  }

  /**
   * Add an edge to the learning path
   */
  addEdge(edge: LearningPathEdge): Result<void, BusinessRuleError> {
    if (!this._props.edges) {
      this._props.edges = [];
    }

    // Validate that source and target nodes exist
    const sourceExists = this._props.nodes?.some(
      (n) => n.id === edge.sourceNodeId
    );
    const targetExists = this._props.nodes?.some(
      (n) => n.id === edge.targetNodeId
    );

    if (!sourceExists) {
      return Result.fail(
        new BusinessRuleError('Source node does not exist')
      );
    }

    if (!targetExists) {
      return Result.fail(
        new BusinessRuleError('Target node does not exist')
      );
    }

    // Check if edge already exists
    const edgeExists = this._props.edges.some(
      (e) =>
        e.sourceNodeId === edge.sourceNodeId &&
        e.targetNodeId === edge.targetNodeId
    );

    if (edgeExists) {
      return Result.fail(
        new BusinessRuleError('Edge already exists in learning path')
      );
    }

    this._props.edges.push(edge);
    this.touch();

    return Result.ok(undefined);
  }

  /**
   * Remove an edge from the learning path
   */
  removeEdge(edgeId: string): Result<void, BusinessRuleError> {
    if (!this._props.edges) {
      this._props.edges = [];
    }

    const edgeIndex = this._props.edges.findIndex((e) => e.id === edgeId);
    if (edgeIndex === -1) {
      return Result.fail(
        new BusinessRuleError('Edge not found in learning path')
      );
    }

    this._props.edges.splice(edgeIndex, 1);
    this.touch();

    return Result.ok(undefined);
  }

  /**
   * Get node by ID
   */
  getNode(nodeId: string): LearningPathNode | undefined {
    return this._props.nodes?.find((n) => n.id === nodeId);
  }

  /**
   * Get edge by ID
   */
  getEdge(edgeId: string): LearningPathEdge | undefined {
    return this._props.edges?.find((e) => e.id === edgeId);
  }

  toObject(): LearningPathProps & {
    id: string;
    createdAt: Date;
    updatedAt: Date;
  } {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      isPublished: this.isPublished,
      createdBy: this.createdBy,
      nodes: this.nodes,
      edges: this.edges,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  clone(): LearningPath {
    return new LearningPath({ ...this._props }, this._id);
  }
}
