/**
 * Update File Use Case
 */

import { BaseUseCase } from '@/core/shared/use-case.interface';
import { Result } from '@/core/shared/result';
import { NotFoundError, ForbiddenError } from '@/core/shared/errors';
import type { IFileRepository } from '../../domain/file.repository.interface';
import type { UpdateFileDTO } from '../dtos';
import { type FileDTO, fileMapper } from '../../infrastructure/file.mapper';

interface UpdateFileRequest {
  fileId: string;
  dto: UpdateFileDTO;
  currentUserId: string;
}

export class UpdateFileUseCase extends BaseUseCase<
  UpdateFileRequest,
  FileDTO
> {
  constructor(private fileRepository: IFileRepository) {
    super();
  }

  async execute(request: UpdateFileRequest): Promise<Result<FileDTO>> {
    const { fileId, dto, currentUserId } = request;

    // Find file
    const fileResult = await this.fileRepository.findById(fileId);

    if (fileResult.isFailure) {
      return Result.fail(fileResult.error);
    }

    if (!fileResult.value) {
      return Result.fail(new NotFoundError('File', fileId));
    }

    const file = fileResult.value;

    // Check permission (only uploader can update)
    if (file.uploadedBy !== currentUserId) {
      return Result.fail(
        new ForbiddenError('You do not have permission to update this file')
      );
    }

    // Update isPublic
    if (dto.isPublic !== undefined) {
      if (dto.isPublic) {
        const markPublicResult = file.markAsPublic();
        if (markPublicResult.isFailure) {
          return Result.fail(markPublicResult.error);
        }
      } else {
        const markPrivateResult = file.markAsPrivate();
        if (markPrivateResult.isFailure) {
          return Result.fail(markPrivateResult.error);
        }
      }
    }

    // Update tags
    if (dto.tags !== undefined) {
      // Remove existing tags that are not in the new list
      const currentTags = file.tags;
      for (const tag of currentTags) {
        if (!dto.tags.includes(tag)) {
          file.removeTag(tag);
        }
      }

      // Add new tags
      for (const tag of dto.tags) {
        if (!currentTags.includes(tag)) {
          const addTagResult = file.addTag(tag);
          if (addTagResult.isFailure) {
            return Result.fail(addTagResult.error);
          }
        }
      }
    }

    // Update metadata
    if (dto.metadata !== undefined) {
      file.updateMetadata(dto.metadata);
    }

    // Save to repository
    const savedResult = await this.fileRepository.save(file);

    if (savedResult.isFailure) {
      return Result.fail(savedResult.error);
    }

    // Map to DTO
    const fileDTO = fileMapper.toDTO(savedResult.value);

    return Result.ok(fileDTO);
  }
}
