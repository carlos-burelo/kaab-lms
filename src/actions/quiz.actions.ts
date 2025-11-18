'use server'
import { revalidatePath } from 'next/cache'
import z from 'zod'
import { courseRepository } from '@/database/repositories'
import { getSession } from '@/lib/auth'
import { QuizRepository } from '@/modules/quiz/infrastructure/quiz.repository'
import {
  CreateQuizUseCase,
  UpdateQuizUseCase,
  GetQuizUseCase,
  DeleteQuizUseCase,
  CreateQuestionUseCase,
  UpdateQuestionUseCase,
  DeleteQuestionUseCase,
  CreateAnswerOptionUseCase,
  UpdateAnswerOptionUseCase,
  DeleteAnswerOptionUseCase,
  GetQuizQuestionsForStudentUseCase,
  StartQuizAttemptUseCase,
  SaveQuizAnswerUseCase,
  CompleteQuizAttemptUseCase,
  GetUserQuizAttemptsUseCase,
} from '@/modules/quiz/application/use-cases'

/**
 * Quiz Actions
 * Server actions para operaciones de quizzes
 *
 * ARQUITECTURA:
 * Client (startTransition) -> Server Action (validación, autorización) -> Use Case -> Repository (BD)
 */

// ============================================================================
// INITIALIZE USE CASES
// ============================================================================

const quizRepository = new QuizRepository()
const createQuizUseCase = new CreateQuizUseCase(quizRepository)
const updateQuizUseCase = new UpdateQuizUseCase(quizRepository)
const getQuizUseCase = new GetQuizUseCase(quizRepository)
const deleteQuizUseCase = new DeleteQuizUseCase(quizRepository)
const createQuestionUseCase = new CreateQuestionUseCase()
const updateQuestionUseCase = new UpdateQuestionUseCase()
const deleteQuestionUseCase = new DeleteQuestionUseCase()
const createAnswerOptionUseCase = new CreateAnswerOptionUseCase()
const updateAnswerOptionUseCase = new UpdateAnswerOptionUseCase()
const deleteAnswerOptionUseCase = new DeleteAnswerOptionUseCase()
const getQuizQuestionsForStudentUseCase = new GetQuizQuestionsForStudentUseCase()
const startQuizAttemptUseCase = new StartQuizAttemptUseCase()
const saveQuizAnswerUseCase = new SaveQuizAnswerUseCase()
const completeQuizAttemptUseCase = new CompleteQuizAttemptUseCase()
const getUserQuizAttemptsUseCase = new GetUserQuizAttemptsUseCase()

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
    const result = await getQuizUseCase.execute({ quizId })

    if (result.isFailure) {
      throw new Error(result.error.message)
    }

    return {
      success: true,
      data: result.value
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
    const result = await quizRepository.findByLesson(lessonId)

    if (result.isFailure) {
      throw new Error(result.error.message)
    }

    return {
      success: true,
      data: result.value
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

    const result = await createQuizUseCase.execute({
      dto: parsed.data,
      currentUserId: session.id,
    })

    if (result.isFailure) {
      throw new Error(result.error.message)
    }

    revalidatePath('/instructor/cursos')

    return {
      success: true,
      data: result.value
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

    const result = await updateQuizUseCase.execute({
      dto: { id, ...updateData },
      currentUserId: session.id,
    })

    if (result.isFailure) {
      throw new Error(result.error.message)
    }

    revalidatePath('/instructor/cursos')

    return {
      success: true,
      data: result.value
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

    const result = await deleteQuizUseCase.execute({
      quizId,
      currentUserId: session.id,
    })

    if (result.isFailure) {
      throw new Error(result.error.message)
    }

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

    const session = await getSession()
    if (!session?.id) {
      return {
        success: false,
        error: 'User not authenticated'
      }
    }

    const result = await createQuestionUseCase.execute({
      ...parsed.data,
      currentUserId: session.id,
    })

    if (result.isFailure) {
      throw new Error(result.error.message)
    }

    return {
      success: true,
      data: result.value
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

    const session = await getSession()
    if (!session?.id) {
      return {
        success: false,
        error: 'User not authenticated'
      }
    }

    const result = await updateQuestionUseCase.execute({
      questionId,
      data: obj,
      currentUserId: session.id,
    })

    if (result.isFailure) {
      throw new Error(result.error.message)
    }

    return {
      success: true,
      data: result.value
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
    const session = await getSession()
    if (!session?.id) {
      return {
        success: false,
        error: 'User not authenticated'
      }
    }

    const result = await deleteQuestionUseCase.execute({
      questionId,
      currentUserId: session.id,
    })

    if (result.isFailure) {
      throw new Error(result.error.message)
    }

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

    const session = await getSession()
    if (!session?.id) {
      return {
        success: false,
        error: 'User not authenticated'
      }
    }

    const result = await createAnswerOptionUseCase.execute({
      ...parsed.data,
      currentUserId: session.id,
    })

    if (result.isFailure) {
      throw new Error(result.error.message)
    }

    return {
      success: true,
      data: result.value
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

    const session = await getSession()
    if (!session?.id) {
      return {
        success: false,
        error: 'User not authenticated'
      }
    }

    const result = await updateAnswerOptionUseCase.execute({
      optionId,
      data: obj,
      currentUserId: session.id,
    })

    if (result.isFailure) {
      throw new Error(result.error.message)
    }

    return {
      success: true,
      data: result.value
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
    const session = await getSession()
    if (!session?.id) {
      return {
        success: false,
        error: 'User not authenticated'
      }
    }

    const result = await deleteAnswerOptionUseCase.execute({
      optionId,
      currentUserId: session.id,
    })

    if (result.isFailure) {
      throw new Error(result.error.message)
    }

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
    const session = await getSession()
    if (!session?.id) {
      return {
        success: false,
        error: 'User not authenticated'
      }
    }

    const result = await getQuizQuestionsForStudentUseCase.execute({
      quizId,
      currentUserId: session.id,
    })

    if (result.isFailure) {
      throw new Error(result.error.message)
    }

    return {
      success: true,
      data: result.value
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
    const result = await startQuizAttemptUseCase.execute({
      userId,
      quizId,
    })

    if (result.isFailure) {
      throw new Error(result.error.message)
    }

    return {
      success: true,
      data: result.value
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

    const session = await getSession()
    if (!session?.id) {
      return {
        success: false,
        error: 'User not authenticated'
      }
    }

    const result = await saveQuizAnswerUseCase.execute({
      attemptId: obj.attemptId as string,
      questionId: obj.questionId as string,
      selectedOptionId: obj.selectedOptionId as string | undefined,
      answerText: obj.answerText as string | undefined,
      currentUserId: session.id,
    })

    if (result.isFailure) {
      throw new Error(result.error.message)
    }

    return {
      success: true,
      data: result.value
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
    const session = await getSession()
    if (!session?.id) {
      return {
        success: false,
        error: 'User not authenticated'
      }
    }

    const result = await completeQuizAttemptUseCase.execute({
      attemptId,
      score,
      passed,
      currentUserId: session.id,
    })

    if (result.isFailure) {
      throw new Error(result.error.message)
    }

    return {
      success: true,
      data: result.value
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
    const result = await getUserQuizAttemptsUseCase.execute({
      userId,
      quizId,
    })

    if (result.isFailure) {
      throw new Error(result.error.message)
    }

    return {
      success: true,
      data: result.value
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error getting quiz attempts'
    }
  }
}
