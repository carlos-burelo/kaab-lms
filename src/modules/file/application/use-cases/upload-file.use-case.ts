/**
 * Upload File Use Case
 */

import { BaseUseCase } from '@/core/shared/use-case.interface';
import { Result } from '@/core/shared/result';
import { File } from '../../domain/file.entity';
import type { IFileRepository } from '../../domain/file.repository.interface';
import type { UploadFileDTO } from '../dtos';
import { type FileDTO, fileMapper } from '../../infrastructure/file.mapper';

interface UploadFileRequest {
  dto: UploadFileDTO;
  currentUserId: string;
}

export class UploadFileUseCase extends BaseUseCase<
  UploadFileRequest,
  FileDTO
> {
  constructor(private fileRepository: IFileRepository) {
    super();
  }

  async execute(request: UploadFileRequest): Promise<Result<FileDTO>> {
    const { dto, currentUserId } = request;

    // Ensure uploadedBy matches the current user
    if (dto.uploadedBy !== currentUserId) {
      dto.uploadedBy = currentUserId;
    }

    // Create file entity
    const fileResult = File.create({
      filename: dto.filename,
      originalFilename: dto.originalFilename,
      mimeType: dto.mimeType,
      size: dto.size,
      path: dto.path,
      url: dto.url,
      uploadedBy: dto.uploadedBy,
      isPublic: dto.isPublic,
      tags: dto.tags,
      metadata: dto.metadata,
    });

    if (fileResult.isFailure) {
      return Result.fail(fileResult.error);
    }

    // Save to repository
    const savedResult = await this.fileRepository.save(fileResult.value);

    if (savedResult.isFailure) {
      return Result.fail(savedResult.error);
    }

    // Map to DTO
    const fileDTO = fileMapper.toDTO(savedResult.value);

    return Result.ok(fileDTO);
  }
}
