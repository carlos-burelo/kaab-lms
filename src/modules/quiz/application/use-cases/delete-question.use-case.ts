/**
 * Delete Question Use Case
 * Deletes a quiz question
 */

import { Result } from '@/core/shared/result'
import { BaseUseCase } from '@/core/shared/use-case.interface'
import { prisma } from '@/lib/prisma'

interface DeleteQuestionRequest {
  questionId: string
  currentUserId: string
}

interface DeleteQuestionResponse {
  id: string
}

export class DeleteQuestionUseCase extends BaseUseCase<DeleteQuestionRequest, DeleteQuestionResponse> {
  async execute(request: DeleteQuestionRequest): Promise<Result<DeleteQuestionResponse>> {
    const { questionId } = request

    try {
      await prisma.quizQuestion.delete({
        where: { id: questionId }
      })

      return Result.ok({ id: questionId })
    } catch (error) {
      return Result.fail(new Error(`Failed to delete question: ${(error as Error).message}`))
    }
  }
}
