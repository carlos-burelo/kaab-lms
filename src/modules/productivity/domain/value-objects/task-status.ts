/**
 * Task Status Value Object
 */

export enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export function isValidTaskStatus(value: string): value is TaskStatus {
  return Object.values(TaskStatus).includes(value as TaskStatus);
}

export function canTransitionTo(
  from: TaskStatus,
  to: TaskStatus
): boolean {
  const allowedTransitions: Record<TaskStatus, TaskStatus[]> = {
    [TaskStatus.PENDING]: [TaskStatus.IN_PROGRESS, TaskStatus.CANCELLED],
    [TaskStatus.IN_PROGRESS]: [TaskStatus.COMPLETED, TaskStatus.CANCELLED, TaskStatus.PENDING],
    [TaskStatus.COMPLETED]: [TaskStatus.IN_PROGRESS],
    [TaskStatus.CANCELLED]: [TaskStatus.PENDING],
  };

  return allowedTransitions[from].includes(to);
}

export function isTerminalStatus(status: TaskStatus): boolean {
  return status === TaskStatus.COMPLETED || status === TaskStatus.CANCELLED;
}
