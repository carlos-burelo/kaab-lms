/**
 * Search Files Use Case
 */

import { BaseUseCase } from '@/core/shared/use-case.interface';
import { Result } from '@/core/shared/result';
import type { IFileRepository, SearchFilesOptions } from '../../domain/file.repository.interface';
import { type FileDTO, fileMapper } from '../../infrastructure/file.mapper';

interface SearchFilesRequest {
  options: SearchFilesOptions;
  currentUserId: string;
}

export class SearchFilesUseCase extends BaseUseCase<
  SearchFilesRequest,
  FileDTO[]
> {
  constructor(private fileRepository: IFileRepository) {
    super();
  }

  async execute(request: SearchFilesRequest): Promise<Result<FileDTO[]>> {
    const { options, currentUserId } = request;

    // If not searching for public files and no uploader specified,
    // default to current user's files
    if (options.isPublic !== true && !options.uploadedBy) {
      options.uploadedBy = currentUserId;
    }

    // Search files
    const filesResult = await this.fileRepository.search(options);

    if (filesResult.isFailure) {
      return Result.fail(filesResult.error);
    }

    // Map to DTOs
    const fileDTOs = filesResult.value.map((file) => fileMapper.toDTO(file));

    return Result.ok(fileDTOs);
  }
}
