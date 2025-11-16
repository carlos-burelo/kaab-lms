'use server'
import { revalidatePath } from 'next/cache'
import z from 'zod'
import { courseRepository, quizRepository } from '@/database/repositories'
import { getSession } from '@/lib/auth'

/**
 * Quiz Actions
 * Server actions para operaciones de quizzes
 *
 * ARQUITECTURA:
 * Client (startTransition) -> Server Action (validación, autorización) -> Repository (BD)
 */

// ============================================================================
// SCHEMAS - VALIDACIÓN
// ============================================================================

const CreateQuizSchema = z.object({
  lessonId: z.string().min(1, 'Lesson ID is required'),
  title: z.string().min(1, 'Title is required').min(3, 'Minimum 3 characters'),
  description: z.string().optional(),
  instructions: z.string().optional(),
  durationMinutes: z.number().optional(),
  passingScore: z.number().min(0).max(100).default(60),
  maxAttempts: z.number().optional(),
  showAnswers: z.boolean().default(true),
  shuffleQuestions: z.boolean().default(false)
})

const UpdateQuizSchema = CreateQuizSchema.extend({
  id: z.string().min(1, 'Quiz ID is required')
})

const CreateQuestionSchema = z.object({
  quizId: z.string().min(1, 'Quiz ID is required'),
  text: z.string().min(1, 'Question text is required'),
  explanation: z.string().optional(),
  type: z.enum(['MULTIPLE_CHOICE', 'SINGLE_CHOICE', 'TRUE_FALSE', 'SHORT_ANSWER', 'LONG_ANSWER', 'ORDERING', 'MATCHING']),
  points: z.number().min(0).default(1),
  position: z.number().default(0),
  fileId: z.string().optional()
})

const CreateAnswerOptionSchema = z.object({
  questionId: z.string().min(1, 'Question ID is required'),
  text: z.string().min(1, 'Option text is required'),
  isCorrect: z.boolean().default(false),
  position: z.number().default(0)
})

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

type ActionResponse<T = any> = {
  success: boolean
  data?: T
  error?: string
  redirect?: string
}

// ============================================================================
// QUIZ OPERATIONS
// ============================================================================

/**
 * Obtiene un quiz por ID
 */
export async function getQuizById(quizId: string): Promise<ActionResponse> {
  try {
    const quiz = await quizRepository.getById(quizId)
    return {
      success: true,
      data: quiz
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error getting quiz'
    }
  }
}

/**
 * Obtiene un quiz por lessonId
 */
export async function getQuizByLessonId(lessonId: string): Promise<ActionResponse> {
  try {
    const quiz = await quizRepository.getByLessonId(lessonId)
    return {
      success: true,
      data: quiz
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error getting quiz'
    }
  }
}

/**
 * Crea un nuevo quiz
 */
export async function createQuiz(formData: FormData): Promise<ActionResponse> {
  try {
    const obj = Object.fromEntries(formData.entries())
    const parsed = CreateQuizSchema.safeParse(obj)

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || 'Validation error'
      }
    }

    const session = await getSession()
    if (!session?.id) {
      return {
        success: false,
        error: 'User not authenticated'
      }
    }

    // Verify instructor owns the course
    const lesson = await courseRepository.getLesson(parsed.data.lessonId)
    if (!lesson) {
      return {
        success: false,
        error: 'Lesson not found'
      }
    }

    const quiz = await quizRepository.create(parsed.data)

    revalidatePath('/instructor/cursos')

    return {
      success: true,
      data: quiz
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error creating quiz'
    }
  }
}

/**
 * Actualiza un quiz
 */
export async function updateQuiz(formData: FormData): Promise<ActionResponse> {
  try {
    const obj = Object.fromEntries(formData.entries())
    const parsed = UpdateQuizSchema.safeParse(obj)

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || 'Validation error'
      }
    }

    const session = await getSession()
    if (!session?.id) {
      return {
        success: false,
        error: 'User not authenticated'
      }
    }

    const { id, ...updateData } = parsed.data

    const quiz = await quizRepository.update(id, updateData)

    revalidatePath('/instructor/cursos')

    return {
      success: true,
      data: quiz
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error updating quiz'
    }
  }
}

/**
 * Elimina un quiz
 */
export async function deleteQuiz(quizId: string): Promise<ActionResponse> {
  try {
    const session = await getSession()
    if (!session?.id) {
      return {
        success: false,
        error: 'User not authenticated'
      }
    }

    const quiz = await quizRepository.getById(quizId)
    if (!quiz) {
      return {
        success: false,
        error: 'Quiz not found'
      }
    }

    await quizRepository.delete(quizId)

    revalidatePath('/instructor/cursos')

    return {
      success: true,
      data: { id: quizId }
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error deleting quiz'
    }
  }
}

// ============================================================================
// QUESTION OPERATIONS
// ============================================================================

/**
 * Crea una pregunta para un quiz
 */
export async function createQuestion(formData: FormData): Promise<ActionResponse> {
  try {
    const obj = Object.fromEntries(formData.entries())
    const parsed = CreateQuestionSchema.safeParse(obj)

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || 'Validation error'
      }
    }

    const question = await quizRepository.createQuestion(parsed.data)

    return {
      success: true,
      data: question
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error creating question'
    }
  }
}

/**
 * Actualiza una pregunta
 */
export async function updateQuestion(questionId: string, formData: FormData): Promise<ActionResponse> {
  try {
    const obj = Object.fromEntries(formData.entries())

    const question = await quizRepository.updateQuestion(questionId, obj)

    return {
      success: true,
      data: question
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error updating question'
    }
  }
}

/**
 * Elimina una pregunta
 */
export async function deleteQuestion(questionId: string): Promise<ActionResponse> {
  try {
    await quizRepository.deleteQuestion(questionId)

    return {
      success: true,
      data: { id: questionId }
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error deleting question'
    }
  }
}

// ============================================================================
// ANSWER OPTION OPERATIONS
// ============================================================================

/**
 * Crea una opción de respuesta
 */
export async function createAnswerOption(formData: FormData): Promise<ActionResponse> {
  try {
    const obj = Object.fromEntries(formData.entries())
    const parsed = CreateAnswerOptionSchema.safeParse(obj)

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || 'Validation error'
      }
    }

    const option = await quizRepository.createAnswerOption(parsed.data)

    return {
      success: true,
      data: option
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error creating answer option'
    }
  }
}

/**
 * Actualiza una opción de respuesta
 */
export async function updateAnswerOption(optionId: string, formData: FormData): Promise<ActionResponse> {
  try {
    const obj = Object.fromEntries(formData.entries())

    const option = await quizRepository.updateAnswerOption(optionId, obj)

    return {
      success: true,
      data: option
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error updating answer option'
    }
  }
}

/**
 * Elimina una opción de respuesta
 */
export async function deleteAnswerOption(optionId: string): Promise<ActionResponse> {
  try {
    await quizRepository.deleteAnswerOption(optionId)

    return {
      success: true,
      data: { id: optionId }
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error deleting answer option'
    }
  }
}

// ============================================================================
// STUDENT QUIZ OPERATIONS
// ============================================================================

/**
 * Obtiene las preguntas del quiz para el estudiante
 */
export async function getQuizQuestionsForStudent(quizId: string): Promise<ActionResponse> {
  try {
    const quiz = await quizRepository.getById(quizId)
    if (!quiz) {
      return {
        success: false,
        error: 'Quiz not found'
      }
    }

    const questions = await quizRepository.getQuestionsForStudent(quizId, quiz.shuffleQuestions)

    return {
      success: true,
      data: {
        quiz: {
          id: quiz.id,
          title: quiz.title,
          description: quiz.description,
          instructions: quiz.instructions,
          durationMinutes: quiz.durationMinutes,
          showAnswers: quiz.showAnswers
        },
        questions
      }
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error getting quiz questions'
    }
  }
}

/**
 * Inicia un intento de quiz
 */
export async function startQuizAttempt(userId: string, quizId: string): Promise<ActionResponse> {
  try {
    const quiz = await quizRepository.getById(quizId)
    if (!quiz) {
      return {
        success: false,
        error: 'Quiz not found'
      }
    }

    // Check max attempts
    if (quiz.maxAttempts) {
      const attemptCount = await quizRepository.getUserAttemptCount(userId, quizId)
      if (attemptCount >= quiz.maxAttempts) {
        return {
          success: false,
          error: `Maximum attempts (${quiz.maxAttempts}) reached`
        }
      }
    }

    const nextAttemptNumber = (await quizRepository.getUserAttemptCount(userId, quizId)) + 1

    const attempt = await quizRepository.createAttempt(userId, quizId, nextAttemptNumber)

    return {
      success: true,
      data: attempt
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error starting quiz attempt'
    }
  }
}

/**
 * Guarda una respuesta del usuario
 */
export async function saveQuizAnswer(formData: FormData): Promise<ActionResponse> {
  try {
    const obj = Object.fromEntries(formData.entries())

    const answer = await quizRepository.saveAnswer(obj)

    return {
      success: true,
      data: answer
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error saving answer'
    }
  }
}

/**
 * Completa un intento de quiz
 */
export async function completeQuizAttempt(attemptId: string, score: number, passed: boolean): Promise<ActionResponse> {
  try {
    const attempt = await quizRepository.completeAttempt(attemptId, score, passed)

    return {
      success: true,
      data: attempt
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error completing quiz attempt'
    }
  }
}

/**
 * Obtiene los intentos anteriores de un usuario
 */
export async function getUserQuizAttempts(userId: string, quizId: string): Promise<ActionResponse> {
  try {
    const attempts = await quizRepository.getUserAttempts(userId, quizId)

    return {
      success: true,
      data: attempts
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error getting quiz attempts'
    }
  }
}
