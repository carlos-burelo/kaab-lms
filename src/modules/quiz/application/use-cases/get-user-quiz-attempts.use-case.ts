/**
 * Get User Quiz Attempts Use Case
 * Retrieves all attempts for a specific quiz by a user
 */

import { Result } from '@/core/shared/result'
import { BaseUseCase } from '@/core/shared/use-case.interface'
import { prisma } from '@/lib/prisma'

interface GetUserQuizAttemptsRequest {
  userId: string
  quizId: string
}

interface QuizAttemptDTO {
  id: string
  attemptNumber: number
  score?: number
  passed?: boolean
  startedAt: Date
  completedAt?: Date
  answers: {
    id: string
    questionId: string
    selectedOptionId?: string
    answerText?: string
  }[]
}

export class GetUserQuizAttemptsUseCase extends BaseUseCase<GetUserQuizAttemptsRequest, QuizAttemptDTO[]> {
  async execute(request: GetUserQuizAttemptsRequest): Promise<Result<QuizAttemptDTO[]>> {
    const { userId, quizId } = request

    try {
      const attempts = await prisma.quizAttempt.findMany({
        where: { userId, quizId },
        include: {
          answers: true
        },
        orderBy: { attemptNumber: 'desc' }
      })

      const attemptDTOs: QuizAttemptDTO[] = attempts.map((attempt) => ({
        id: attempt.id,
        attemptNumber: attempt.attemptNumber,
        score: attempt.score || undefined,
        passed: attempt.passed || undefined,
        startedAt: attempt.startedAt,
        completedAt: attempt.completedAt || undefined,
        answers: attempt.answers.map((ans) => ({
          id: ans.id,
          questionId: ans.questionId,
          selectedOptionId: ans.selectedOptionId || undefined,
          answerText: ans.answerText || undefined
        }))
      }))

      return Result.ok(attemptDTOs)
    } catch (error) {
      return Result.fail(new Error(`Failed to get user quiz attempts: ${(error as Error).message}`))
    }
  }
}
