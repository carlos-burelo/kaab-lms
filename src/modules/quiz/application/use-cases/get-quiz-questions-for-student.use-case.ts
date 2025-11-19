/**
 * Get Quiz Questions For Student Use Case
 * Retrieves quiz questions for a student to take the quiz
 */

import { Result } from '@/core/shared/result'
import { BaseUseCase } from '@/core/shared/use-case.interface'
import { prisma } from '@/lib/prisma'

interface GetQuizQuestionsForStudentRequest {
  quizId: string
  currentUserId: string
}

interface QuestionDTO {
  id: string
  text: string
  explanation?: string
  type: string
  points: number
  position: number
  fileId?: string
  options: {
    id: string
    text: string
    position: number
  }[]
}

interface QuizQuestionsResponse {
  quiz: {
    id: string
    title: string
    description?: string
    instructions?: string
    durationMinutes?: number
    showAnswers: boolean
  }
  questions: QuestionDTO[]
}

export class GetQuizQuestionsForStudentUseCase extends BaseUseCase<GetQuizQuestionsForStudentRequest, QuizQuestionsResponse> {
  async execute(request: GetQuizQuestionsForStudentRequest): Promise<Result<QuizQuestionsResponse>> {
    const { quizId } = request

    try {
      const quiz = await prisma.quiz.findUnique({
        where: { id: quizId },
        include: {
          questions: {
            include: {
              options: {
                orderBy: { position: 'asc' }
              },
              file: true
            },
            orderBy: { position: 'asc' }
          }
        }
      })

      if (!quiz) {
        return Result.fail(new Error('Quiz not found'))
      }

      // Shuffle questions if enabled
      let questions = quiz.questions
      if (quiz.shuffleQuestions) {
        questions = [...questions].sort(() => Math.random() - 0.5)
      }

      // Map to DTOs (hiding correct answers)
      const questionDTOs: QuestionDTO[] = questions.map((q) => ({
        id: q.id,
        text: q.text,
        explanation: q.explanation || undefined,
        type: q.type,
        points: q.points,
        position: q.position,
        fileId: q.fileId || undefined,
        options: q.options.map((opt) => ({
          id: opt.id,
          text: opt.text,
          position: opt.position
          // Don't send isCorrect to student
        }))
      }))

      return Result.ok({
        quiz: {
          id: quiz.id,
          title: quiz.title,
          description: quiz.description || undefined,
          instructions: quiz.instructions || undefined,
          durationMinutes: quiz.durationMinutes || undefined,
          showAnswers: quiz.showAnswers
        },
        questions: questionDTOs
      })
    } catch (error) {
      return Result.fail(new Error(`Failed to get quiz questions: ${(error as Error).message}`))
    }
  }
}
