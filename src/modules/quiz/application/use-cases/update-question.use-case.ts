/**
 * Update Question Use Case
 * Updates an existing quiz question
 */

import { Result } from '@/core/shared/result'
import { BaseUseCase } from '@/core/shared/use-case.interface'
import { prisma } from '@/lib/prisma'

interface UpdateQuestionRequest {
  questionId: string
  data: {
    text?: string
    explanation?: string
    type?: string
    points?: number
    position?: number
    fileId?: string
  }
  currentUserId: string
}

interface QuestionDTO {
  id: string
  quizId: string
  text: string
  explanation?: string
  type: string
  points: number
  position: number
  fileId?: string
}

export class UpdateQuestionUseCase extends BaseUseCase<UpdateQuestionRequest, QuestionDTO> {
  async execute(request: UpdateQuestionRequest): Promise<Result<QuestionDTO>> {
    const { questionId, data } = request

    try {
      // Update question
      const question = await prisma.quizQuestion.update({
        where: { id: questionId },
        data
      })

      return Result.ok({
        id: question.id,
        quizId: question.quizId,
        text: question.text,
        explanation: question.explanation || undefined,
        type: question.type,
        points: question.points,
        position: question.position,
        fileId: question.fileId || undefined
      })
    } catch (error) {
      return Result.fail(new Error(`Failed to update question: ${(error as Error).message}`))
    }
  }
}
