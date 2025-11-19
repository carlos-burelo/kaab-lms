/**
 * Complete Quiz Attempt Use Case
 * Completes a quiz attempt and calculates the score
 */

import { Result } from '@/core/shared/result'
import { BaseUseCase } from '@/core/shared/use-case.interface'
import { prisma } from '@/lib/prisma'

interface CompleteQuizAttemptRequest {
  attemptId: string
  score: number
  passed: boolean
  currentUserId: string
}

interface QuizAttemptDTO {
  id: string
  userId: string
  quizId: string
  attemptNumber: number
  score: number
  passed: boolean
  startedAt: Date
  completedAt: Date
}

export class CompleteQuizAttemptUseCase extends BaseUseCase<CompleteQuizAttemptRequest, QuizAttemptDTO> {
  async execute(request: CompleteQuizAttemptRequest): Promise<Result<QuizAttemptDTO>> {
    const { attemptId, score, passed } = request

    try {
      const attempt = await prisma.quizAttempt.update({
        where: { id: attemptId },
        data: {
          score,
          passed,
          completedAt: new Date()
        }
      })

      return Result.ok({
        id: attempt.id,
        userId: attempt.userId,
        quizId: attempt.quizId,
        attemptNumber: attempt.attemptNumber,
        score: attempt.score!,
        passed: attempt.passed!,
        startedAt: attempt.startedAt,
        completedAt: attempt.completedAt!
      })
    } catch (error) {
      return Result.fail(new Error(`Failed to complete quiz attempt: ${(error as Error).message}`))
    }
  }
}
