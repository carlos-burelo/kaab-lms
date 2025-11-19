/**
 * File Uploaded Domain Event
 */

import { DomainEvent } from '@/core/shared/domain-event'

export interface FileUploadedEventPayload {
  fileId: string
  filename: string
  uploadedBy: string
  size: number
  mimeType: string
}

export class FileUploadedEvent extends DomainEvent<FileUploadedEventPayload> {
  constructor(payload: FileUploadedEventPayload) {
    super('file.uploaded', payload)
  }
}
