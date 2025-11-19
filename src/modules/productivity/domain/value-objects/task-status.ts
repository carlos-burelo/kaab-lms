/**
 * Task Status Value Object
 */

import { PersonalTaskStatus } from '@prisma/client'

// export enum TaskStatus {
//   PENDING = 'PENDING',
//   IN_PROGRESS = 'IN_PROGRESS',
//   COMPLETED = 'COMPLETED',
//   CANCELLED = 'CANCELLED',
// }

export function isValidTaskStatus(value: string): value is PersonalTaskStatus {
  return Object.values(PersonalTaskStatus).includes(value as PersonalTaskStatus)
}

export function canTransitionTo(from: PersonalTaskStatus, to: PersonalTaskStatus): boolean {
  const allowedTransitions: Record<PersonalTaskStatus, PersonalTaskStatus[]> = {
    [PersonalTaskStatus.PENDING]: [PersonalTaskStatus.IN_PROGRESS, PersonalTaskStatus.CANCELED],
    [PersonalTaskStatus.IN_PROGRESS]: [PersonalTaskStatus.COMPLETED, PersonalTaskStatus.CANCELED, PersonalTaskStatus.PENDING],
    [PersonalTaskStatus.COMPLETED]: [PersonalTaskStatus.IN_PROGRESS],
    [PersonalTaskStatus.CANCELED]: [PersonalTaskStatus.PENDING]
  }

  return allowedTransitions[from].includes(to)
}

export function isTerminalStatus(status: PersonalTaskStatus): boolean {
  return status === PersonalTaskStatus.COMPLETED || status === PersonalTaskStatus.CANCELED
}
