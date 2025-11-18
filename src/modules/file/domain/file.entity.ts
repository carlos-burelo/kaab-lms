/**
 * File Aggregate Root
 */

import { AggregateRoot, EntityProps } from '@/core/shared/aggregate-root';
import { Result } from '@/core/shared/result';
import { BusinessRuleError, ValidationError } from '@/core/shared/errors';
import { FileUploadedEvent, FileDeletedEvent } from './events';
import { FileType } from './value-objects/file-type';

export interface FileProps extends EntityProps {
  filename: string;
  originalFilename: string;
  mimeType: string;
  size: number;
  path: string;
  url: string;
  uploadedBy: string;
  isPublic: boolean;
  tags: string[];
  metadata?: Record<string, any>;
}

export class File extends AggregateRoot<FileProps> {
  get filename(): string {
    return this._props.filename;
  }

  get originalFilename(): string {
    return this._props.originalFilename;
  }

  get mimeType(): string {
    return this._props.mimeType;
  }

  get size(): number {
    return this._props.size;
  }

  get path(): string {
    return this._props.path;
  }

  get url(): string {
    return this._props.url;
  }

  get uploadedBy(): string {
    return this._props.uploadedBy;
  }

  get isPublic(): boolean {
    return this._props.isPublic;
  }

  get tags(): string[] {
    return [...this._props.tags];
  }

  get metadata(): Record<string, any> | undefined {
    return this._props.metadata ? { ...this._props.metadata } : undefined;
  }

  private constructor(props: FileProps, id?: string) {
    super(props, id);
  }

  /**
   * Create a new file
   */
  static create(
    props: Omit<FileProps, 'id' | 'createdAt' | 'updatedAt'>
  ): Result<File, ValidationError> {
    // Validations
    if (!props.filename || props.filename.trim().length === 0) {
      return Result.fail(
        new ValidationError('Filename is required', 'filename')
      );
    }

    if (!props.originalFilename || props.originalFilename.trim().length === 0) {
      return Result.fail(
        new ValidationError('Original filename is required', 'originalFilename')
      );
    }

    if (!props.mimeType || props.mimeType.trim().length === 0) {
      return Result.fail(
        new ValidationError('MIME type is required', 'mimeType')
      );
    }

    // Validate MIME type
    const fileTypeResult = FileType.create(props.mimeType);
    if (fileTypeResult.isFailure) {
      return Result.fail(fileTypeResult.error);
    }

    if (props.size <= 0) {
      return Result.fail(
        new ValidationError('File size must be positive', 'size')
      );
    }

    if (!props.path || props.path.trim().length === 0) {
      return Result.fail(
        new ValidationError('File path is required', 'path')
      );
    }

    if (!props.url || props.url.trim().length === 0) {
      return Result.fail(
        new ValidationError('File URL is required', 'url')
      );
    }

    if (!props.uploadedBy || props.uploadedBy.trim().length === 0) {
      return Result.fail(
        new ValidationError('Uploader ID is required', 'uploadedBy')
      );
    }

    const file = new File(
      {
        ...props,
        tags: props.tags || [],
      },
      props.id
    );

    // Emit domain event
    file.addDomainEvent(
      new FileUploadedEvent({
        fileId: file.id,
        filename: file.filename,
        uploadedBy: file.uploadedBy,
        size: file.size,
        mimeType: file.mimeType,
      })
    );

    return Result.ok(file);
  }

  /**
   * Mark file as public
   */
  markAsPublic(): Result<void, BusinessRuleError> {
    if (this._props.isPublic) {
      return Result.fail(new BusinessRuleError('File is already public'));
    }

    this._props.isPublic = true;
    this.touch();

    return Result.ok(undefined);
  }

  /**
   * Mark file as private
   */
  markAsPrivate(): Result<void, BusinessRuleError> {
    if (!this._props.isPublic) {
      return Result.fail(new BusinessRuleError('File is already private'));
    }

    this._props.isPublic = false;
    this.touch();

    return Result.ok(undefined);
  }

  /**
   * Add a tag to the file
   */
  addTag(tag: string): Result<void, ValidationError> {
    const normalizedTag = tag.trim().toLowerCase();

    if (normalizedTag.length === 0) {
      return Result.fail(
        new ValidationError('Tag cannot be empty', 'tag')
      );
    }

    if (this._props.tags.includes(normalizedTag)) {
      return Result.fail(
        new ValidationError('Tag already exists', 'tag')
      );
    }

    this._props.tags.push(normalizedTag);
    this.touch();

    return Result.ok(undefined);
  }

  /**
   * Remove a tag from the file
   */
  removeTag(tag: string): Result<void, ValidationError> {
    const normalizedTag = tag.trim().toLowerCase();
    const index = this._props.tags.indexOf(normalizedTag);

    if (index === -1) {
      return Result.fail(
        new ValidationError('Tag does not exist', 'tag')
      );
    }

    this._props.tags.splice(index, 1);
    this.touch();

    return Result.ok(undefined);
  }

  /**
   * Update file metadata
   */
  updateMetadata(metadata: Record<string, any>): void {
    this._props.metadata = { ...metadata };
    this.touch();
  }

  /**
   * Check if user can access this file
   */
  canBeAccessedBy(userId: string): boolean {
    // Public files can be accessed by anyone
    if (this._props.isPublic) {
      return true;
    }

    // Private files can only be accessed by the uploader
    return this._props.uploadedBy === userId;
  }

  /**
   * Check if user can delete this file
   */
  canBeDeletedBy(userId: string, isAdmin: boolean = false): boolean {
    // Admins can delete any file
    if (isAdmin) {
      return true;
    }

    // Only the uploader can delete their own files
    return this._props.uploadedBy === userId;
  }

  /**
   * Get file type
   */
  getFileType(): Result<FileType, ValidationError> {
    return FileType.create(this._props.mimeType);
  }

  /**
   * Check if file is an image
   */
  isImage(): boolean {
    const fileTypeResult = this.getFileType();
    return fileTypeResult.isSuccess && fileTypeResult.value.isImage();
  }

  /**
   * Check if file is a video
   */
  isVideo(): boolean {
    const fileTypeResult = this.getFileType();
    return fileTypeResult.isSuccess && fileTypeResult.value.isVideo();
  }

  /**
   * Check if file is an audio file
   */
  isAudio(): boolean {
    const fileTypeResult = this.getFileType();
    return fileTypeResult.isSuccess && fileTypeResult.value.isAudio();
  }

  /**
   * Check if file is a document
   */
  isDocument(): boolean {
    const fileTypeResult = this.getFileType();
    return fileTypeResult.isSuccess && fileTypeResult.value.isDocument();
  }

  /**
   * Mark file for deletion
   */
  markForDeletion(deletedBy: string): void {
    this.addDomainEvent(
      new FileDeletedEvent({
        fileId: this.id,
        filename: this.filename,
        deletedBy,
      })
    );
  }

  toObject(): FileProps & {
    id: string;
    createdAt: Date;
    updatedAt: Date;
  } {
    return {
      id: this.id,
      filename: this.filename,
      originalFilename: this.originalFilename,
      mimeType: this.mimeType,
      size: this.size,
      path: this.path,
      url: this.url,
      uploadedBy: this.uploadedBy,
      isPublic: this.isPublic,
      tags: this.tags,
      metadata: this.metadata,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  clone(): File {
    return new File({ ...this._props }, this._id);
  }
}
