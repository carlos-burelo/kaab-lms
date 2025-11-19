/**
 * Save Quiz Answer Use Case
 * Saves a student's answer to a quiz question
 */

import { Result } from '@/core/shared/result'
import { BaseUseCase } from '@/core/shared/use-case.interface'
import { prisma } from '@/lib/prisma'

interface SaveQuizAnswerRequest {
  attemptId: string
  questionId: string
  selectedOptionId?: string
  answerText?: string
  currentUserId: string
}

interface QuizAnswerDTO {
  id: string
  attemptId: string
  questionId: string
  selectedOptionId?: string
  answerText?: string
}

export class SaveQuizAnswerUseCase extends BaseUseCase<SaveQuizAnswerRequest, QuizAnswerDTO> {
  async execute(request: SaveQuizAnswerRequest): Promise<Result<QuizAnswerDTO>> {
    const { attemptId, questionId, selectedOptionId, answerText } = request

    try {
      // Upsert answer (update if exists, create if not)
      const answer = await prisma.quizAnswer.upsert({
        where: {
          attemptId_questionId: {
            attemptId,
            questionId
          }
        },
        update: {
          selectedOptionId,
          answerText
        },
        create: {
          attemptId,
          questionId,
          selectedOptionId,
          answerText
        }
      })

      return Result.ok({
        id: answer.id,
        attemptId: answer.attemptId,
        questionId: answer.questionId,
        selectedOptionId: answer.selectedOptionId || undefined,
        answerText: answer.answerText || undefined
      })
    } catch (error) {
      return Result.fail(new Error(`Failed to save quiz answer: ${(error as Error).message}`))
    }
  }
}
