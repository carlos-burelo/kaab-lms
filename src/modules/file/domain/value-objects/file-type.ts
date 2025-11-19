/**
 * FileType Value Object
 */

import { ValueObject } from '@/core/shared/value-object';
import { Result } from '@/core/shared/result';
import { ValidationError } from '@/core/shared/errors';

export enum FileCategory {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  AUDIO = 'AUDIO',
  DOCUMENT = 'DOCUMENT',
  ARCHIVE = 'ARCHIVE',
  OTHER = 'OTHER',
}

export interface FileTypeProps {
  mimeType: string;
  category: FileCategory;
}

export class FileType extends ValueObject<FileTypeProps> {
  // Common MIME types mapping
  private static readonly MIME_TYPE_CATEGORIES: Record<string, FileCategory> = {
    // Images
    'image/jpeg': FileCategory.IMAGE,
    'image/jpg': FileCategory.IMAGE,
    'image/png': FileCategory.IMAGE,
    'image/gif': FileCategory.IMAGE,
    'image/webp': FileCategory.IMAGE,
    'image/svg+xml': FileCategory.IMAGE,
    'image/bmp': FileCategory.IMAGE,

    // Videos
    'video/mp4': FileCategory.VIDEO,
    'video/mpeg': FileCategory.VIDEO,
    'video/webm': FileCategory.VIDEO,
    'video/ogg': FileCategory.VIDEO,
    'video/quicktime': FileCategory.VIDEO,
    'video/x-msvideo': FileCategory.VIDEO,

    // Audio
    'audio/mpeg': FileCategory.AUDIO,
    'audio/mp3': FileCategory.AUDIO,
    'audio/wav': FileCategory.AUDIO,
    'audio/ogg': FileCategory.AUDIO,
    'audio/webm': FileCategory.AUDIO,
    'audio/aac': FileCategory.AUDIO,

    // Documents
    'application/pdf': FileCategory.DOCUMENT,
    'application/msword': FileCategory.DOCUMENT,
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': FileCategory.DOCUMENT,
    'application/vnd.ms-excel': FileCategory.DOCUMENT,
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': FileCategory.DOCUMENT,
    'application/vnd.ms-powerpoint': FileCategory.DOCUMENT,
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': FileCategory.DOCUMENT,
    'text/plain': FileCategory.DOCUMENT,
    'text/csv': FileCategory.DOCUMENT,
    'text/html': FileCategory.DOCUMENT,
    'text/css': FileCategory.DOCUMENT,
    'text/javascript': FileCategory.DOCUMENT,
    'application/json': FileCategory.DOCUMENT,
    'application/xml': FileCategory.DOCUMENT,

    // Archives
    'application/zip': FileCategory.ARCHIVE,
    'application/x-rar-compressed': FileCategory.ARCHIVE,
    'application/x-7z-compressed': FileCategory.ARCHIVE,
    'application/x-tar': FileCategory.ARCHIVE,
    'application/gzip': FileCategory.ARCHIVE,
  };

  get mimeType(): string {
    return this._props.mimeType;
  }

  get category(): FileCategory {
    return this._props.category;
  }

  private constructor(props: FileTypeProps) {
    super(props);
  }

  static create(mimeType: string): Result<FileType, ValidationError> {
    if (!mimeType || mimeType.trim().length === 0) {
      return Result.fail(
        new ValidationError('MIME type is required', 'mimeType')
      );
    }

    const normalizedMimeType = mimeType.toLowerCase().trim();
    const category = FileType.MIME_TYPE_CATEGORIES[normalizedMimeType] || FileCategory.OTHER;

    return Result.ok(
      new FileType({
        mimeType: normalizedMimeType,
        category,
      })
    );
  }

  isImage(): boolean {
    return this._props.category === FileCategory.IMAGE;
  }

  isVideo(): boolean {
    return this._props.category === FileCategory.VIDEO;
  }

  isAudio(): boolean {
    return this._props.category === FileCategory.AUDIO;
  }

  isDocument(): boolean {
    return this._props.category === FileCategory.DOCUMENT;
  }

  isArchive(): boolean {
    return this._props.category === FileCategory.ARCHIVE;
  }

  isMedia(): boolean {
    return this.isImage() || this.isVideo() || this.isAudio();
  }

  toString(): string {
    return this._props.mimeType;
  }
}
