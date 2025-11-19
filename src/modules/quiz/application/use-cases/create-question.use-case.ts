/**
 * Create Question Use Case
 * Creates a new question for a quiz
 */

import type { QuestionType } from '@prisma/client'
import { Result } from '@/core/shared/result'
import { BaseUseCase } from '@/core/shared/use-case.interface'
import { prisma } from '@/lib/prisma'

interface CreateQuestionRequest {
  quizId: string
  text: string
  explanation?: string
  type: QuestionType
  points: number
  position: number
  fileId?: string
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

export class CreateQuestionUseCase extends BaseUseCase<CreateQuestionRequest, QuestionDTO> {
  async execute(request: CreateQuestionRequest): Promise<Result<QuestionDTO>> {
    const { quizId, text, explanation, type, points, position, fileId } = request

    try {
      // Verify quiz exists
      const quiz = await prisma.quiz.findUnique({
        where: { id: quizId }
      })

      if (!quiz) {
        return Result.fail(new Error('Quiz not found'))
      }

      // Create question
      const question = await prisma.quizQuestion.create({
        data: {
          quizId,
          text,
          explanation,
          type,
          points,
          position,
          fileId
        }
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
      return Result.fail(new Error(`Failed to create question: ${(error as Error).message}`))
    }
  }
}
