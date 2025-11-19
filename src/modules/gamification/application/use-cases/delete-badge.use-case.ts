/**
 * Delete Badge Use Case
 */

import { BaseUseCase } from '@/core/shared/use-case.interface';
import { Result } from '@/core/shared/result';
import { NotFoundError } from '@/core/shared/errors';
import type { IBadgeRepository } from '../../domain/badge.repository.interface';

interface DeleteBadgeRequest {
  badgeId: string;
  currentUserId: string;
}

export class DeleteBadgeUseCase extends BaseUseCase<DeleteBadgeRequest, void> {
  constructor(private badgeRepository: IBadgeRepository) {
    super();
  }

  async execute(request: DeleteBadgeRequest): Promise<Result<void>> {
    const { badgeId } = request;

    // Find badge to ensure it exists
    const badgeResult = await this.badgeRepository.findById(badgeId);

    if (badgeResult.isFailure) {
      return Result.fail(badgeResult.error);
    }

    if (!badgeResult.value) {
      return Result.fail(new NotFoundError('Badge', badgeId));
    }

    // Delete badge
    const deleteResult = await this.badgeRepository.delete(badgeId);

    if (deleteResult.isFailure) {
      return Result.fail(deleteResult.error);
    }

    return Result.ok(undefined);
  }
}
