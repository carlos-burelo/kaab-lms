/**
 * PersonalTask Aggregate Root
 */

import { AggregateRoot, type EntityProps } from '@/core/shared/aggregate-root';
import { Result } from '@/core/shared/result';
import { BusinessRuleError, ValidationError } from '@/core/shared/errors';
import { type TaskPriority, TaskStatus, canTransitionTo } from './value-objects';
import {
  TaskCreatedEvent,
  TaskCompletedEvent,
  TaskStatusChangedEvent,
  TaskCancelledEvent,
} from './events';

export interface PersonalTaskProps extends EntityProps {
  userId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: Date;
  completedAt?: Date;
}

export class PersonalTask extends AggregateRoot<PersonalTaskProps> {
  get userId(): string {
    return this._props.userId;
  }

  get title(): string {
    return this._props.title;
  }

  get description(): string | undefined {
    return this._props.description;
  }

  get status(): TaskStatus {
    return this._props.status;
  }

  get priority(): TaskPriority {
    return this._props.priority;
  }

  get dueDate(): Date | undefined {
    return this._props.dueDate;
  }

  get completedAt(): Date | undefined {
    return this._props.completedAt;
  }

  private constructor(props: PersonalTaskProps, id?: string) {
    super(props, id);
  }

  /**
   * Create a new personal task
   */
  static create(
    props: Omit<PersonalTaskProps, 'id' | 'status' | 'completedAt' | 'createdAt' | 'updatedAt'>
  ): Result<PersonalTask, ValidationError> {
    // Validations
    if (props.title.trim().length < 1) {
      return Result.fail(
        new ValidationError('Title cannot be empty', 'title')
      );
    }

    if (props.title.trim().length > 200) {
      return Result.fail(
        new ValidationError('Title must be less than 200 characters', 'title')
      );
    }

    if (props.description && props.description.length > 2000) {
      return Result.fail(
        new ValidationError('Description must be less than 2000 characters', 'description')
      );
    }

    if (props.dueDate && props.dueDate < new Date()) {
      return Result.fail(
        new ValidationError('Due date cannot be in the past', 'dueDate')
      );
    }

    const task = new PersonalTask(
      {
        ...props,
        status: TaskStatus.PENDING,
        completedAt: undefined,
      },
      props.id
    );

    // Emit domain event
    task.addDomainEvent(
      new TaskCreatedEvent({
        taskId: task.id,
        userId: task.userId,
        title: task.title,
        priority: task.priority,
        dueDate: task.dueDate,
      })
    );

    return Result.ok(task);
  }

  /**
   * Complete the task
   */
  complete(): Result<void, BusinessRuleError> {
    if (this._props.status === TaskStatus.COMPLETED) {
      return Result.fail(new BusinessRuleError('Task is already completed'));
    }

    if (this._props.status === TaskStatus.CANCELLED) {
      return Result.fail(new BusinessRuleError('Cannot complete a cancelled task'));
    }

    const previousStatus = this._props.status;
    this._props.status = TaskStatus.COMPLETED;
    this._props.completedAt = new Date();
    this.touch();

    // Emit domain events
    this.addDomainEvent(
      new TaskStatusChangedEvent({
        taskId: this.id,
        userId: this.userId,
        previousStatus,
        newStatus: TaskStatus.COMPLETED,
      })
    );

    this.addDomainEvent(
      new TaskCompletedEvent({
        taskId: this.id,
        userId: this.userId,
        title: this.title,
        completedAt: this._props.completedAt,
      })
    );

    return Result.ok(undefined);
  }

  /**
   * Cancel the task
   */
  cancel(): Result<void, BusinessRuleError> {
    if (this._props.status === TaskStatus.CANCELLED) {
      return Result.fail(new BusinessRuleError('Task is already cancelled'));
    }

    if (this._props.status === TaskStatus.COMPLETED) {
      return Result.fail(new BusinessRuleError('Cannot cancel a completed task'));
    }

    const previousStatus = this._props.status;
    this._props.status = TaskStatus.CANCELLED;
    this._props.completedAt = undefined;
    this.touch();

    // Emit domain events
    this.addDomainEvent(
      new TaskStatusChangedEvent({
        taskId: this.id,
        userId: this.userId,
        previousStatus,
        newStatus: TaskStatus.CANCELLED,
      })
    );

    this.addDomainEvent(
      new TaskCancelledEvent({
        taskId: this.id,
        userId: this.userId,
        title: this.title,
      })
    );

    return Result.ok(undefined);
  }

  /**
   * Update task status
   */
  updateStatus(newStatus: TaskStatus): Result<void, BusinessRuleError> {
    if (this._props.status === newStatus) {
      return Result.fail(new BusinessRuleError('Task is already in this status'));
    }

    if (!canTransitionTo(this._props.status, newStatus)) {
      return Result.fail(
        new BusinessRuleError(
          `Cannot transition from ${this._props.status} to ${newStatus}`
        )
      );
    }

    const previousStatus = this._props.status;
    this._props.status = newStatus;

    // Handle completion
    if (newStatus === TaskStatus.COMPLETED) {
      this._props.completedAt = new Date();
    } else {
      this._props.completedAt = undefined;
    }

    this.touch();

    this.addDomainEvent(
      new TaskStatusChangedEvent({
        taskId: this.id,
        userId: this.userId,
        previousStatus,
        newStatus,
      })
    );

    return Result.ok(undefined);
  }

  /**
   * Update task priority
   */
  updatePriority(newPriority: TaskPriority): Result<void, ValidationError> {
    if (this._props.status === TaskStatus.COMPLETED) {
      return Result.fail(
        new ValidationError('Cannot update priority of completed task', 'priority')
      );
    }

    this._props.priority = newPriority;
    this.touch();

    return Result.ok(undefined);
  }

  /**
   * Update due date
   */
  updateDueDate(newDueDate: Date | undefined): Result<void, ValidationError> {
    if (newDueDate && newDueDate < new Date()) {
      return Result.fail(
        new ValidationError('Due date cannot be in the past', 'dueDate')
      );
    }

    this._props.dueDate = newDueDate;
    this.touch();

    return Result.ok(undefined);
  }

  /**
   * Update task title
   */
  updateTitle(newTitle: string): Result<void, ValidationError> {
    if (newTitle.trim().length < 1) {
      return Result.fail(
        new ValidationError('Title cannot be empty', 'title')
      );
    }

    if (newTitle.trim().length > 200) {
      return Result.fail(
        new ValidationError('Title must be less than 200 characters', 'title')
      );
    }

    this._props.title = newTitle;
    this.touch();

    return Result.ok(undefined);
  }

  /**
   * Update task description
   */
  updateDescription(description: string | undefined): Result<void, ValidationError> {
    if (description && description.length > 2000) {
      return Result.fail(
        new ValidationError('Description must be less than 2000 characters', 'description')
      );
    }

    this._props.description = description;
    this.touch();

    return Result.ok(undefined);
  }

  /**
   * Check if task is overdue
   */
  isOverdue(): boolean {
    if (!this._props.dueDate) {
      return false;
    }

    if (this._props.status === TaskStatus.COMPLETED || this._props.status === TaskStatus.CANCELLED) {
      return false;
    }

    return this._props.dueDate < new Date();
  }

  /**
   * Check if task can be edited by user
   */
  canBeEditedBy(userId: string): boolean {
    return this._props.userId === userId;
  }

  toObject(): PersonalTaskProps & {
    id: string;
    createdAt: Date;
    updatedAt: Date;
  } {
    return {
      id: this.id,
      userId: this.userId,
      title: this.title,
      description: this.description,
      status: this.status,
      priority: this.priority,
      dueDate: this.dueDate,
      completedAt: this.completedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  clone(): PersonalTask {
    return new PersonalTask({ ...this._props }, this._id);
  }
}
