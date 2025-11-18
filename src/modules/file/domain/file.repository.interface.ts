/**
 * File Repository Interface
 */

import { Repository } from '@/core/shared/repository.interface';
import { Result } from '@/core/shared/result';
import { File } from './file.entity';

export interface SearchFilesOptions {
  uploadedBy?: string;
  isPublic?: boolean;
  tags?: string[];
  mimeType?: string;
  limit?: number;
  offset?: number;
}

export interface IFileRepository extends Repository<File> {
  /**
   * Find files by uploader
   */
  findByUploader(userId: string): Promise<Result<File[]>>;

  /**
   * Find public files
   */
  findPublicFiles(limit?: number, offset?: number): Promise<Result<File[]>>;

  /**
   * Find files by tags
   */
  findByTags(tags: string[]): Promise<Result<File[]>>;

  /**
   * Search files with filters
   */
  search(options: SearchFilesOptions): Promise<Result<File[]>>;

  /**
   * Count files by uploader
   */
  countByUploader(userId: string): Promise<Result<number>>;

  /**
   * Get total storage used by uploader
   */
  getTotalStorageByUploader(userId: string): Promise<Result<number>>;
}
