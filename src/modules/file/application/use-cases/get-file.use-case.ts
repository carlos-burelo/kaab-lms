/**
 * Get File Use Case
 */

import { BaseUseCase } from '@/core/shared/use-case.interface';
import { Result } from '@/core/shared/result';
import { NotFoundError, ForbiddenError } from '@/core/shared/errors';
import { IFileRepository } from '../../domain/file.repository.interface';
import { FileDTO, fileMapper } from '../../infrastructure/file.mapper';

interface GetFileRequest {
  fileId: string;
  currentUserId: string;
}

export class GetFileUseCase extends BaseUseCase<GetFileRequest, FileDTO> {
  constructor(private fileRepository: IFileRepository) {
    super();
  }

  async execute(request: GetFileRequest): Promise<Result<FileDTO>> {
    const { fileId, currentUserId } = request;

    // Find file
    const fileResult = await this.fileRepository.findById(fileId);

    if (fileResult.isFailure) {
      return Result.fail(fileResult.error);
    }

    if (!fileResult.value) {
      return Result.fail(new NotFoundError('File', fileId));
    }

    const file = fileResult.value;

    // Check access permission
    if (!file.canBeAccessedBy(currentUserId)) {
      return Result.fail(
        new ForbiddenError('You do not have permission to access this file')
      );
    }

    // Map to DTO
    const fileDTO = fileMapper.toDTO(file);

    return Result.ok(fileDTO);
  }
}
