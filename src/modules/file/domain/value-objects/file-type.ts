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
