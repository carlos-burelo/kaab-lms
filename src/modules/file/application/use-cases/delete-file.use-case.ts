/**
 * Delete File Use Case
 */

import { BaseUseCase } from '@/core/shared/use-case.interface';
import { Result } from '@/core/shared/result';
import { NotFoundError, ForbiddenError } from '@/core/shared/errors';
import { IFileRepository } from '../../domain/file.repository.interface';

interface DeleteFileRequest {
  fileId: string;
  currentUserId: string;
  isAdmin?: boolean;
}

export class DeleteFileUseCase extends BaseUseCase<DeleteFileRequest, void> {
  constructor(private fileRepository: IFileRepository) {
    super();
  }

  async execute(request: DeleteFileRequest): Promise<Result<void>> {
    const { fileId, currentUserId, isAdmin = false } = request;

    // Find file
    const fileResult = await this.fileRepository.findById(fileId);

    if (fileResult.isFailure) {
      return Result.fail(fileResult.error);
    }

    if (!fileResult.value) {
      return Result.fail(new NotFoundError('File', fileId));
    }

    const file = fileResult.value;

    // Check permission
    if (!file.canBeDeletedBy(currentUserId, isAdmin)) {
      return Result.fail(
        new ForbiddenError('You do not have permission to delete this file')
      );
    }

    // Mark for deletion (emit domain event)
    file.markForDeletion(currentUserId);

    // Save to trigger events
    const saveResult = await this.fileRepository.save(file);
    if (saveResult.isFailure) {
      return Result.fail(saveResult.error);
    }

    // Delete from repository
    const deleteResult = await this.fileRepository.delete(fileId);

    if (deleteResult.isFailure) {
      return Result.fail(deleteResult.error);
    }

    return Result.ok(undefined);
  }
}
