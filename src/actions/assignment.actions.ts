'use server'

import { revalidatePath } from 'next/cache'
import z from 'zod'
import { instructorRepository, studentRepository } from '@/database/repositories'
import { getSession } from '@/lib/auth'
import { AssignmentRepository } from '@/modules/assignment/infrastructure/assignment.repository'
import {
  CreateAssignmentUseCase,
  UpdateAssignmentUseCase,
  GetAssignmentUseCase,
  DeleteAssignmentUseCase,
  SubmitAssignmentUseCase,
  GradeAssignmentUseCase,
  GetAssignmentSubmissionsUseCase,
  GetStudentAssignmentSubmissionsUseCase,
} from '@/modules/assignment/application/use-cases'

// ============================================================================
// INITIALIZE USE CASES
// ============================================================================

const assignmentRepository = new AssignmentRepository()
const createAssignmentUseCase = new CreateAssignmentUseCase(assignmentRepository)
const updateAssignmentUseCase = new UpdateAssignmentUseCase(assignmentRepository)
const getAssignmentUseCase = new GetAssignmentUseCase(assignmentRepository)
const deleteAssignmentUseCase = new DeleteAssignmentUseCase(assignmentRepository)
const submitAssignmentUseCase = new SubmitAssignmentUseCase(assignmentRepository)
const gradeAssignmentUseCase = new GradeAssignmentUseCase(assignmentRepository)
const getAssignmentSubmissionsUseCase = new GetAssignmentSubmissionsUseCase(assignmentRepository)
const getStudentAssignmentSubmissionsUseCase = new GetStudentAssignmentSubmissionsUseCase()

// ============================================================================
// SCHEMAS - VALIDACIÓN
// ============================================================================

const CreateAssignmentSchema = z.object({
  lessonId: z.string().min(1, 'El ID de la lección es requerido'),
  courseId: z.string().min(1, 'El ID del curso es requerido'),
  title: z.string().min(1, 'El título es obligatorio').min(3, 'Mínimo 3 caracteres'),
  description: z.string().optional(),
  instructions: z.string().optional(),
  dueDate: z.string().datetime('Fecha inválida'),
  maxScore: z
    .string()
    .refine((val) => !Number.isNaN(Number.parseFloat(val)), 'La puntuación máxima debe ser un número')
    .refine((val) => Number.parseFloat(val) > 0, 'La puntuación máxima debe ser mayor a 0'),
  allowLateSubmission: z.boolean().default(false),
  latePenaltyPercent: z
    .string()
    .optional()
    .refine((val) => !val || !Number.isNaN(Number.parseFloat(val)), 'El porcentaje de penalización debe ser un número')
    .refine(
      (val) => !val || (Number.parseFloat(val) >= 0 && Number.parseFloat(val) <= 100),
      'El porcentaje debe estar entre 0 y 100'
    )
})

const UpdateAssignmentSchema = CreateAssignmentSchema.extend({
  assignmentId: z.string().min(1, 'El ID de la asignación es requerido')
})

const SubmitAssignmentSchema = z.object({
  assignmentId: z.string().min(1),
  courseId: z.string().min(1),
  submissionText: z.string().optional(),
  fileIds: z.array(z.string()).optional().default([])
})

const GradeAssignmentSchema = z.object({
  submissionId: z.string().min(1),
  score: z
    .string()
    .refine((val) => !Number.isNaN(Number.parseFloat(val)), 'La puntuación debe ser un número')
    .refine((val) => Number.parseFloat(val) >= 0, 'La puntuación no puede ser negativa'),
  feedback: z.string().optional(),
  status: z.enum(['GRADED', 'NEEDS_REVISION']).default('GRADED')
})

// ============================================================================
// CREAR ASIGNACIÓN
// ============================================================================

export async function createAssignment(data: z.infer<typeof CreateAssignmentSchema>) {
  try {
    const session = await getSession()
    if (!session?.id) {
      throw new Error('No autenticado')
    }

    const validated = CreateAssignmentSchema.parse(data)

    // Verificar que el instructor sea propietario del curso
    const course = await instructorRepository.getCourseById(validated.courseId)
    if (!course) {
      throw new Error('Curso no encontrado')
    }

    if (course.instructorId !== session.id) {
      throw new Error('No tienes permiso para crear asignaciones en este curso')
    }

    // Execute use case
    const result = await createAssignmentUseCase.execute({
      dto: {
        lessonId: validated.lessonId,
        courseId: validated.courseId,
        title: validated.title,
        description: validated.description,
        instructions: validated.instructions,
        dueDate: new Date(validated.dueDate),
        maxScore: Number.parseFloat(validated.maxScore),
        allowLateSubmission: validated.allowLateSubmission,
        latePenaltyPercent: validated.latePenaltyPercent ? Number.parseFloat(validated.latePenaltyPercent) : null,
      },
      currentUserId: session.id,
    })

    if (result.isFailure) {
      throw new Error(result.error.message)
    }

    revalidatePath(`/instructor/cursos/${validated.courseId}`)
    return { success: true, data: result.value }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al crear asignación'
    return { success: false, error: message }
  }
}

// ============================================================================
// ACTUALIZAR ASIGNACIÓN
// ============================================================================

export async function updateAssignment(data: z.infer<typeof UpdateAssignmentSchema>) {
  try {
    const session = await getSession()
    if (!session?.id) {
      throw new Error('No autenticado')
    }

    const validated = UpdateAssignmentSchema.parse(data)

    // Verificar que el instructor sea propietario del curso
    const course = await instructorRepository.getCourseById(validated.courseId)
    if (!course) {
      throw new Error('Curso no encontrado')
    }

    if (course.instructorId !== session.id) {
      throw new Error('No tienes permiso para actualizar asignaciones en este curso')
    }

    // Execute use case
    const result = await updateAssignmentUseCase.execute({
      dto: {
        id: validated.assignmentId,
        title: validated.title,
        description: validated.description,
        dueDate: validated.dueDate ? new Date(validated.dueDate) : undefined,
        maxScore: validated.maxScore ? Number.parseFloat(validated.maxScore) : undefined,
      },
      currentUserId: session.id,
    })

    if (result.isFailure) {
      throw new Error(result.error.message)
    }

    revalidatePath(`/instructor/cursos/${validated.courseId}`)
    return { success: true, data: result.value }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al actualizar asignación'
    return { success: false, error: message }
  }
}

// ============================================================================
// OBTENER ASIGNACIÓN
// ============================================================================

export async function getAssignmentById(assignmentId: string) {
  try {
    const session = await getSession()
    const result = await getAssignmentUseCase.execute({
      assignmentId,
      currentUserId: session.id,
    })

    if (result.isFailure) {
      throw new Error(result.error.message)
    }

    return { success: true, data: result.value }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al obtener asignación'
    return { success: false, error: message }
  }
}

// ============================================================================
// ELIMINAR ASIGNACIÓN
// ============================================================================

export async function deleteAssignment(assignmentId: string, courseId: string) {
  try {
    const session = await getSession()
    if (!session?.id) {
      throw new Error('No autenticado')
    }

    const course = await instructorRepository.getCourseById(courseId)
    if (!course) {
      throw new Error('Curso no encontrado')
    }

    if (course.instructorId !== session.id) {
      throw new Error('No tienes permiso para eliminar asignaciones en este curso')
    }

    const result = await deleteAssignmentUseCase.execute({
      assignmentId,
      currentUserId: session.id,
    })

    if (result.isFailure) {
      throw new Error(result.error.message)
    }

    revalidatePath(`/instructor/cursos/${courseId}`)
    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al eliminar asignación'
    return { success: false, error: message }
  }
}

// ============================================================================
// ENVIAR ASIGNACIÓN (ESTUDIANTE)
// ============================================================================

export async function submitAssignment(data: z.infer<typeof SubmitAssignmentSchema>) {
  try {
    const session = await getSession()
    if (!session?.id) {
      throw new Error('No autenticado')
    }

    const validated = SubmitAssignmentSchema.parse(data)

    // Verificar que el estudiante está inscrito en el curso
    const enrollment = await studentRepository.getEnrollmentByCourseId(validated.courseId, session.id)
    if (!enrollment) {
      throw new Error('No estás inscrito en este curso')
    }

    // Execute use case
    const result = await submitAssignmentUseCase.execute({
      dto: {
        assignmentId: validated.assignmentId,
        courseId: validated.courseId,
        submissionText: validated.submissionText,
        fileIds: validated.fileIds || [],
      },
      currentUserId: session.id,
    })

    if (result.isFailure) {
      throw new Error(result.error.message)
    }

    revalidatePath(`/estudiante/cursos/${validated.courseId}`)
    return { success: true, data: result.value }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al enviar asignación'
    return { success: false, error: message }
  }
}

// ============================================================================
// CALIFICAR ASIGNACIÓN (INSTRUCTOR)
// ============================================================================

export async function gradeAssignment(submissionId: string, courseId: string, data: z.infer<typeof GradeAssignmentSchema>) {
  try {
    const session = await getSession()
    if (!session?.id) {
      throw new Error('No autenticado')
    }

    const validated = GradeAssignmentSchema.parse(data)

    // Verificar que el instructor sea propietario del curso
    const course = await instructorRepository.getCourseById(courseId)
    if (!course) {
      throw new Error('Curso no encontrado')
    }

    if (course.instructorId !== session.id) {
      throw new Error('No tienes permiso para calificar en este curso')
    }

    const result = await gradeAssignmentUseCase.execute({
      dto: {
        submissionId,
        score: Number.parseFloat(validated.score),
        feedback: validated.feedback,
      },
      currentUserId: session.id,
    })

    if (result.isFailure) {
      throw new Error(result.error.message)
    }

    revalidatePath(`/instructor/cursos/${courseId}`)
    return { success: true, data: result.value }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al calificar asignación'
    return { success: false, error: message }
  }
}

// ============================================================================
// OBTENER ENTREGAS DE ASIGNACIÓN
// ============================================================================

export async function getAssignmentSubmissions(assignmentId: string, courseId: string) {
  try {
    const session = await getSession()
    if (!session?.id) {
      throw new Error('No autenticado')
    }

    const course = await instructorRepository.getCourseById(courseId)
    if (!course) {
      throw new Error('Curso no encontrado')
    }

    if (course.instructorId !== session.id) {
      throw new Error('No tienes permiso para ver estas entregas')
    }

    const result = await getAssignmentSubmissionsUseCase.execute({
      assignmentId,
      currentUserId: session.id,
    })

    if (result.isFailure) {
      throw new Error(result.error.message)
    }

    return { success: true, data: result.value }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al obtener entregas'
    return { success: false, error: message }
  }
}

// ============================================================================
// OBTENER ENTREGAS DEL ESTUDIANTE
// ============================================================================

export async function getStudentAssignmentSubmissions(courseId: string) {
  try {
    const session = await getSession()
    if (!session?.id) {
      throw new Error('No autenticado')
    }

    const result = await getStudentAssignmentSubmissionsUseCase.execute({
      courseId,
      currentUserId: session.id,
    })

    if (result.isFailure) {
      throw new Error(result.error.message)
    }

    return { success: true, data: result.value }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al obtener entregas'
    return { success: false, error: message }
  }
}
