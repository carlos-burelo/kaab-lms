/**
 * File Deleted Domain Event
 */

import { DomainEvent } from '@/core/shared/domain-event'

export interface FileDeletedEventPayload {
  fileId: string
  filename: string
  deletedBy: string
}

export class FileDeletedEvent extends DomainEvent<FileDeletedEventPayload> {
  constructor(payload: FileDeletedEventPayload) {
    super('file.deleted', payload)
  }
}
