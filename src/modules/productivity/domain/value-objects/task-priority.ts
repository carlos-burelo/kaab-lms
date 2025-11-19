/**
 * Task Priority Value Object
 */

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export function isValidTaskPriority(value: string): value is TaskPriority {
  return Object.values(TaskPriority).includes(value as TaskPriority)
}

export function getTaskPriorityWeight(priority: TaskPriority): number {
  const weights = {
    [TaskPriority.LOW]: 1,
    [TaskPriority.MEDIUM]: 2,
    [TaskPriority.HIGH]: 3,
    [TaskPriority.URGENT]: 4
  }
  return weights[priority]
}

export function compareTaskPriorities(a: TaskPriority, b: TaskPriority): number {
  return getTaskPriorityWeight(b) - getTaskPriorityWeight(a)
}
