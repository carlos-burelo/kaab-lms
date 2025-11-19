/**
 * Delete Answer Option Use Case
 * Deletes an answer option
 */

import { Result } from '@/core/shared/result'
import { BaseUseCase } from '@/core/shared/use-case.interface'
import { prisma } from '@/lib/prisma'

interface DeleteAnswerOptionRequest {
  optionId: string
  currentUserId: string
}

interface DeleteAnswerOptionResponse {
  id: string
}

export class DeleteAnswerOptionUseCase extends BaseUseCase<DeleteAnswerOptionRequest, DeleteAnswerOptionResponse> {
  async execute(request: DeleteAnswerOptionRequest): Promise<Result<DeleteAnswerOptionResponse>> {
    const { optionId } = request

    try {
      await prisma.quizAnswerOption.delete({
        where: { id: optionId }
      })

      return Result.ok({ id: optionId })
    } catch (error) {
      return Result.fail(new Error(`Failed to delete answer option: ${(error as Error).message}`))
    }
  }
}
