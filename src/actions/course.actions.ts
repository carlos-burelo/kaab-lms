'use server'
import { error } from 'node:console'
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { CourseLevel } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import z from 'zod'
import { courseRepository, instructorRepository, studentRepository } from '@/database/repositories'
import { getSession } from '@/lib/auth'
import { prisma, slugify } from '@/lib/prisma'

/**
 * Course Actions
 *
 * ARQUITECTURA:
 * Client (startTransition) -> Server Action (validación, autorización, cookies) -> Repository (BD)
 *
 * Pattern:
 * 1. Recibe FormData o datos del cliente
 * 2. Valida con Zod
 * 3. Obtiene sesión y valida autorización
 * 4. Llama al repositorio para operaciones de BD
 * 5. Revalida rutas y redirige si es necesario
 * 6. Retorna error o success
 */

// ============================================================================
// SCHEMAS - VALIDACIÓN
// ============================================================================

const CreateCourseSchema = z
  .object({
    title: z.string().min(1, 'El título es obligatorio').min(3, 'Mínimo 3 caracteres'),
    description: z.string().optional(),
    level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']).optional(),
    categoryId: z.string().optional(),
    requirements: z.string().optional(),
    objectives: z.string().optional(),
    imageId: z.string().optional(),
    price: z
      .string()
      .optional()
      .refine((val) => !val || !Number.isNaN(parseFloat(val)), 'El precio debe ser un número válido')
      .refine((val) => !val || parseFloat(val) >= 0, 'El precio no puede ser negativo'),
    discountPrice: z
      .string()
      .optional()
      .refine((val) => !val || !Number.isNaN(parseFloat(val)), 'El precio con descuento debe ser un número válido')
      .refine((val) => !val || parseFloat(val) >= 0, 'El precio con descuento no puede ser negativo'),
    durationMinutes: z
      .string()
      .optional()
      .refine((val) => !val || !Number.isNaN(parseInt(val, 10)), 'La duración debe ser un número válido')
      .refine((val) => !val || parseInt(val, 10) >= 0, 'La duración no puede ser negativa')
  })
  .refine(
    (data) => {
      // Si ambos precios están presentes, discountPrice debe ser menor que price
      if (data.price && data.discountPrice) {
        const price = parseFloat(data.price)
        const discountPrice = parseFloat(data.discountPrice)
        return discountPrice < price
      }
      return true
    },
    {
      message: 'El precio con descuento debe ser menor que el precio normal',
      path: ['discountPrice']
    }
  )

const UpdateCourseSchema = CreateCourseSchema.safeExtend({
  id: z.string().min(1, 'Course ID es requerido')
})

const CreateModuleSchema = z.object({
  courseId: z.string().min(1),
  title: z.string().min(1, 'El título es obligatorio').min(3, 'Mínimo 3 caracteres')
})

const UpdateModuleSchema = z.object({
  moduleId: z.string().min(1),
  title: z.string().min(1, 'El título es obligatorio').min(3, 'Mínimo 3 caracteres')
})

const CreateLessonSchema = z.object({
  moduleId: z.string().min(1),
  courseId: z.string().min(1),
  title: z.string().min(1, 'El título es obligatorio').min(3, 'Mínimo 3 caracteres')
})

const UpdateLessonSchema = z.object({
  lessonId: z.string().min(1),
  title: z.string().optional(),
  description: z.string().optional(),
  durationMinutes: z.number().optional()
})

const CreateLessonContentSchema = z.object({
  lessonId: z.string().min(1),
  type: z.string().min(1),
  title: z.string().optional(),
  content: z.string().optional(),
  fileId: z.string().optional(),
  metadata: z.any().optional()
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
// PUBLIC COURSE QUERIES
// ============================================================================

/**
 * Obtiene un curso por ID (acceso público)
 */
export async function getCourseById(courseId: string): Promise<ActionResponse> {
  try {
    const course = await courseRepository.getById(courseId)
    return {
      success: true,
      data: course
    }
  } catch (_error) {
    return {
      success: false,
      error: _error instanceof Error ? _error.message : 'Error obteniendo curso'
    }
  }
}

/**
 * Obtiene una lección específica
 */
export async function getLessonById(lessonId: string): Promise<ActionResponse> {
  try {
    const lesson = await courseRepository.getLesson(lessonId)
    return {
      success: true,
      data: lesson
    }
  } catch (_error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error obteniendo lección'
    }
  }
}

/**
 * Obtiene categorías activas
 */
export async function getCategories(): Promise<ActionResponse> {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { position: 'asc' }
    })
    return {
      success: true,
      data: categories
    }
  } catch (_error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error obteniendo categorías'
    }
  }
}

/**
 * Obtiene cursos disponibles para inscripción
 */
export async function getAvailableCourses(): Promise<ActionResponse> {
  try {
    const session = await getSession()
    if (!session?.id) {
      return {
        success: false,
        error: 'Usuario no autenticado'
      }
    }

    const courses = await studentRepository.getAvailableCourses(session.id)
    return {
      success: true,
      data: courses
    }
  } catch (_error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error obteniendo cursos'
    }
  }
}

/**
 * Obtiene cursos destacados
 */
export async function getFeaturedCourses(): Promise<ActionResponse> {
  try {
    const courses = await courseRepository.getFeatured()
    return {
      success: true,
      data: courses
    }
  } catch (_error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error obteniendo cursos destacados'
    }
  }
}

/**
 * Busca cursos
 */
export async function searchCourses(term: string, limit = 20, skip = 0): Promise<ActionResponse> {
  try {
    const courses = await courseRepository.search(term, limit, skip)
    return {
      success: true,
      data: courses
    }
  } catch (_error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error buscando cursos'
    }
  }
}

// ============================================================================
// INSTRUCTOR COURSE MANAGEMENT
// ============================================================================

/**
 * Obtiene los cursos del instructor autenticado
 */
export async function getMyCourses(): Promise<ActionResponse> {
  try {
    const session = await getSession()
    if (!session?.id) {
      return {
        success: false,
        error: 'Usuario no autenticado'
      }
    }

    // Validar que sea instructor
    if (session.role !== 'INSTRUCTOR') {
      return {
        success: false,
        error: 'No tienes permiso para acceder a esto'
      }
    }

    const courses = await instructorRepository.getMyCourses(session.id)
    return {
      success: true,
      data: courses
    }
  } catch (_error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error obteniendo cursos'
    }
  }
}

/**
 * Crea la información básica de un nuevo curso
 *
 * FLUJO:
 * 1. Client: startTransition(createCourseBasicInfo(formData))
 * 2. Action: Valida, verifica sesión, llamaRepository
 * 3. Repository: Crea en BD
 * 4. Action: Revalida, redirige
 */
export async function createCourseBasicInfo(formData: FormData): Promise<ActionResponse> {
  try {
    // 1. VALIDACIÓN - Parse FormData
    const obj = Object.fromEntries(formData.entries())
    const parsed = CreateCourseSchema.safeParse(obj)

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || 'Error de validación'
      }
    }

    // 2. AUTORIZACIÓN - Obtener sesión
    const session = await getSession()
    if (!session?.id) {
      return {
        success: false,
        error: 'Usuario no autenticado'
      }
    }

    if (session.role !== 'INSTRUCTOR') {
      return {
        success: false,
        error: 'Solo los instructores pueden crear cursos'
      }
    }

    const data = parsed.data

    // Procesar requisitos y objetivos
    const requirements = data.requirements ? data.requirements.split('\n').filter((r) => r.trim()) : undefined
    const objectives = data.objectives ? data.objectives.split('\n').filter((o) => o.trim()) : undefined

    // Convertir precios de string a Decimal
    const price = data.price ? parseFloat(data.price) : undefined
    const discountPrice = data.discountPrice ? parseFloat(data.discountPrice) : undefined
    const durationMinutes = data.durationMinutes ? parseInt(data.durationMinutes, 10) : undefined

    // 3. OPERACIÓN - Llamar repositorio
    const course = await courseRepository.create({
      title: data.title,
      slug: slugify(data.title),
      description: data.description,
      level: (data.level as CourseLevel) || null,
      categoryId: data.categoryId || undefined,
      requirements,
      objectives,
      price,
      discountPrice,
      durationMinutes,
      instructorId: session.id,
      isPublished: false,
      imageId: data.imageId || undefined
    })

    if (!course) {
      return {
        success: false,
        error: 'Error creando el curso'
      }
    }

    // 4. REVALIDACIÓN Y REDIRECCIÓN
    revalidatePath('/instructor/courses')

    return {
      success: true,
      data: course,
      redirect: `/instructor/courses/${course.id}?step=content`
    }
  } catch (_error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error creando curso'
    }
  }
}

/**
 * Actualiza la información básica de un curso
 */
export async function updateCourseBasicInfo(formData: FormData): Promise<ActionResponse> {
  try {
    const obj = Object.fromEntries(formData.entries())
    const parsed = UpdateCourseSchema.safeParse(obj)

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || 'Error de validación'
      }
    }

    const session = await getSession()
    if (!session?.id) {
      return {
        success: false,
        error: 'Usuario no autenticado'
      }
    }

    const data = parsed.data

    // Validar que el curso pertenece al instructor
    const course = await courseRepository.getById(data.id)
    if (!course || course.instructorId !== session.id) {
      return {
        success: false,
        error: 'No tienes permiso para actualizar este curso'
      }
    }

    const requirements = data.requirements ? data.requirements.split('\n').filter((r) => r.trim()) : undefined
    const objectives = data.objectives ? data.objectives.split('\n').filter((o) => o.trim()) : undefined

    // Convertir precios de string a Decimal
    const price = data.price ? parseFloat(data.price) : undefined
    const discountPrice = data.discountPrice ? parseFloat(data.discountPrice) : undefined
    const durationMinutes = data.durationMinutes ? parseInt(data.durationMinutes, 10) : undefined

    const updated = await courseRepository.update(data.id, {
      title: data.title,
      description: data.description,
      level: (data.level as CourseLevel) || null,
      categoryId: data.categoryId || undefined,
      requirements,
      objectives,
      price,
      discountPrice,
      durationMinutes,
      imageId: data.imageId || undefined
    })

    revalidatePath(`/instructor/courses/${data.id}`)

    return {
      success: true,
      data: updated,
      redirect: `/instructor/courses/${data.id}?step=content`
    }
  } catch (_error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error actualizando curso'
    }
  }
}

// ============================================================================
// MODULE MANAGEMENT
// ============================================================================

/**
 * Crea un nuevo módulo
 */
export async function createModule(formData: FormData): Promise<ActionResponse> {
  try {
    const obj = Object.fromEntries(formData.entries())
    const parsed = CreateModuleSchema.safeParse(obj)

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || 'Error de validación'
      }
    }

    const session = await getSession()
    if (!session?.id) {
      return {
        success: false,
        error: 'Usuario no autenticado'
      }
    }

    const { courseId, title } = parsed.data

    // Verificar permisos
    const course = await courseRepository.getById(courseId)
    if (!course || course.instructorId !== session.id) {
      return {
        success: false,
        error: 'No tienes permiso para modificar este curso'
      }
    }

    const lastModule = await prisma.module.findFirst({
      where: { courseId },
      orderBy: { position: 'desc' }
    })

    const module = await prisma.module.create({
      data: {
        courseId,
        title,
        position: (lastModule?.position ?? -1) + 1
      }
    })

    revalidatePath(`/instructor/courses/${courseId}`)

    return {
      success: true,
      data: module
    }
  } catch (_error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error creando módulo'
    }
  }
}

/**
 * Actualiza un módulo
 */
export async function updateModule(formData: FormData): Promise<ActionResponse> {
  try {
    const obj = Object.fromEntries(formData.entries())
    const parsed = UpdateModuleSchema.safeParse(obj)

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || 'Error de validación'
      }
    }

    const { moduleId, title } = parsed.data

    const module = await prisma.module.update({
      where: { id: moduleId },
      data: { title }
    })

    return {
      success: true,
      data: module
    }
  } catch (_error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error actualizando módulo'
    }
  }
}

/**
 * Elimina un módulo
 */
export async function deleteModule(formData: FormData): Promise<ActionResponse> {
  try {
    const moduleId = formData.get('moduleId') as string
    if (!moduleId) {
      return {
        success: false,
        error: 'Module ID requerido'
      }
    }

    const session = await getSession()
    if (!session?.id) {
      return {
        success: false,
        error: 'Usuario no autenticado'
      }
    }

    const module = await prisma.module.findUnique({
      where: { id: moduleId },
      include: { course: true }
    })

    if (!module || module.course.instructorId !== session.id) {
      return {
        success: false,
        error: 'No tienes permiso'
      }
    }

    await prisma.module.delete({
      where: { id: moduleId }
    })

    revalidatePath(`/instructor/courses/${module.courseId}`)

    return {
      success: true,
      data: { id: moduleId }
    }
  } catch (_error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error eliminando módulo'
    }
  }
}

// ============================================================================
// LESSON MANAGEMENT
// ============================================================================

/**
 * Crea una nueva lección
 */
export async function createLesson(formData: FormData): Promise<ActionResponse> {
  try {
    const obj = Object.fromEntries(formData.entries())
    const parsed = CreateLessonSchema.safeParse(obj)

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || 'Error de validación'
      }
    }

    const session = await getSession()
    if (!session?.id) {
      return {
        success: false,
        error: 'Usuario no autenticado'
      }
    }

    const { moduleId, courseId, title } = parsed.data

    // Verificar permisos
    const course = await courseRepository.getById(courseId)
    if (!course || course.instructorId !== session.id) {
      return {
        success: false,
        error: 'No tienes permiso'
      }
    }

    const lastLesson = await prisma.lesson.findFirst({
      where: { moduleId },
      orderBy: { position: 'desc' }
    })

    const lesson = await prisma.lesson.create({
      data: {
        moduleId,
        title,
        position: (lastLesson?.position ?? -1) + 1
      }
    })

    revalidatePath(`/instructor/courses/${courseId}`)

    return {
      success: true,
      data: lesson
    }
  } catch (_error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error creando lección'
    }
  }
}

/**
 * Actualiza una lección
 */
export async function updateLesson(formData: FormData): Promise<ActionResponse> {
  try {
    const obj = Object.fromEntries(formData.entries())
    const parsed = UpdateLessonSchema.safeParse(obj)

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || 'Error de validación'
      }
    }

    const { lessonId, ...updateData } = parsed.data

    const lesson = await prisma.lesson.update({
      where: { id: lessonId },
      data: updateData
    })

    return {
      success: true,
      data: lesson
    }
  } catch (_error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error actualizando lección'
    }
  }
}

/**
 * Elimina una lección
 */
export async function deleteLesson(formData: FormData): Promise<ActionResponse> {
  try {
    const lessonId = formData.get('lessonId') as string
    if (!lessonId) {
      return {
        success: false,
        error: 'Lesson ID requerido'
      }
    }

    const session = await getSession()
    if (!session?.id) {
      return {
        success: false,
        error: 'Usuario no autenticado'
      }
    }

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        module: {
          include: { course: true }
        }
      }
    })

    if (!lesson || lesson.module.course.instructorId !== session.id) {
      return {
        success: false,
        error: 'No tienes permiso'
      }
    }

    await prisma.lesson.delete({
      where: { id: lessonId }
    })

    revalidatePath(`/instructor/courses/${lesson.module.courseId}`)

    return {
      success: true,
      data: { id: lessonId }
    }
  } catch (_error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error eliminando lección'
    }
  }
}

// ============================================================================
// CONTENT MANAGEMENT
// ============================================================================

/**
 * Crea contenido de lección
 */
export async function createLessonContent(formData: FormData): Promise<ActionResponse> {
  try {
    const obj = Object.fromEntries(formData.entries())
    const parsed = CreateLessonContentSchema.safeParse(obj)

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || 'Error de validación'
      }
    }

    const { lessonId, type, title, content, fileId, metadata } = parsed.data

    const lastContent = await prisma.lessonContent.findFirst({
      where: { lessonId },
      orderBy: { position: 'desc' }
    })

    const lessonContent = await prisma.lessonContent.create({
      data: {
        lessonId,
        type: type as any,
        position: (lastContent?.position ?? -1) + 1,
        title,
        content: content || '',
        fileId,
        metadata
      },
      include: { file: true }
    })

    revalidatePath(`/instructor/courses`)

    return {
      success: true,
      data: lessonContent
    }
  } catch (_error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error creando contenido'
    }
  }
}

/**
 * Actualiza contenido de lección
 */
export async function updateLessonContent(formData: FormData): Promise<ActionResponse> {
  try {
    const contentId = formData.get('contentId') as string
    const title = formData.get('title') as string
    const content = formData.get('content') as string
    const fileId = formData.get('fileId') as string | null

    if (!contentId) {
      return {
        success: false,
        error: 'Content ID requerido'
      }
    }

    const updated = await prisma.lessonContent.update({
      where: { id: contentId },
      data: {
        title,
        content,
        fileId: fileId || undefined
      }
    })

    revalidatePath(`/instructor/courses`)

    return {
      success: true,
      data: updated
    }
  } catch (_error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error actualizando contenido'
    }
  }
}

/**
 * Elimina contenido de lección
 */
export async function deleteLessonContent(formData: FormData): Promise<ActionResponse> {
  try {
    const contentId = formData.get('contentId') as string
    if (!contentId) {
      return {
        success: false,
        error: 'Content ID requerido'
      }
    }

    const content = await prisma.lessonContent.findUnique({
      where: { id: contentId }
    })

    if (!content) {
      return {
        success: false,
        error: 'Contenido no encontrado'
      }
    }

    await prisma.lessonContent.delete({
      where: { id: contentId }
    })

    revalidatePath(`/instructor/courses`)

    return {
      success: true,
      data: { id: contentId }
    }
  } catch (_error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error eliminando contenido'
    }
  }
}

// ============================================================================
// PUBLICATION
// ============================================================================

/**
 * Publica un curso
 */
export async function publishCourse(formData: FormData): Promise<ActionResponse> {
  try {
    const courseId = formData.get('courseId') as string
    if (!courseId) {
      return {
        success: false,
        error: 'Course ID requerido'
      }
    }

    const session = await getSession()
    if (!session?.id) {
      return {
        success: false,
        error: 'Usuario no autenticado'
      }
    }

    const course = await courseRepository.getById(courseId)
    if (!course) {
      return {
        success: false,
        error: 'Curso no encontrado'
      }
    }

    if (course.instructorId !== session.id) {
      return {
        success: false,
        error: 'No tienes permiso'
      }
    }

    // Validaciones
    if (!course.title?.trim()) {
      return {
        success: false,
        error: 'El curso debe tener un título'
      }
    }

    if (!course.description?.trim()) {
      return {
        success: false,
        error: 'El curso debe tener una descripción'
      }
    }

    if (!course.categoryId) {
      return {
        success: false,
        error: 'El curso debe tener una categoría'
      }
    }

    if (!course.level) {
      return {
        success: false,
        error: 'El curso debe tener un nivel'
      }
    }

    if (course.modules.length === 0) {
      return {
        success: false,
        error: 'El curso debe tener al menos un módulo'
      }
    }

    const modulesWithoutLessons = course.modules.filter((m) => m.lessons.length === 0)
    if (modulesWithoutLessons.length > 0) {
      return {
        success: false,
        error: 'Todos los módulos deben tener al menos una lección'
      }
    }

    let lessonsWithoutContent = 0
    course.modules.forEach((module) => {
      module.lessons.forEach((lesson) => {
        if (lesson.contents.length === 0) {
          lessonsWithoutContent++
        }
      })
    })

    if (lessonsWithoutContent > 0) {
      return {
        success: false,
        error: `Hay ${lessonsWithoutContent} lecciones sin contenido`
      }
    }

    const published = await courseRepository.publish(courseId)

    revalidatePath(`/instructor/courses/${courseId}`)
    revalidatePath('/instructor/courses')

    return {
      success: true,
      data: published
    }
  } catch (_error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error publicando curso'
    }
  }
}

/**
 * Despublica un curso
 */
export async function unpublishCourse(formData: FormData): Promise<ActionResponse> {
  try {
    const courseId = formData.get('courseId') as string
    if (!courseId) {
      return {
        success: false,
        error: 'Course ID requerido'
      }
    }

    const session = await getSession()
    if (!session?.id) {
      return {
        success: false,
        error: 'Usuario no autenticado'
      }
    }

    const course = await courseRepository.getById(courseId)
    if (!course || course.instructorId !== session.id) {
      return {
        success: false,
        error: 'No tienes permiso'
      }
    }

    const unpublished = await courseRepository.unpublish(courseId)

    revalidatePath(`/instructor/courses/${courseId}`)
    revalidatePath('/instructor/courses')

    return {
      success: true,
      data: unpublished
    }
  } catch (_error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error despublicando curso'
    }
  }
}

// ============================================================================
// FILE OPERATIONS
// ============================================================================

export async function getSessionForUpload() {
  return await getSession()
}

export async function getUploadedFiles(userId: string, type?: string) {
  try {
    const files = await prisma.file.findMany({
      where: {
        userId,
        ...(type && { type })
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    })

    return files.map((file) => ({
      id: file.id,
      name: file.originalName,
      url: file.url,
      type: file.type,
      mimeType: file.mimeType,
      sizeInBytes: file.sizeInBytes.toString(),
      createdAt: file.createdAt
    }))
  } catch (_error) {
    console.error('Error fetching files:', error)
    return []
  }
}

export async function uploadFile(file: File, uploadedBy: string): Promise<ActionResponse> {
  const maxSize = 100 * 1024 * 1024
  if (file.size > maxSize) {
    return {
      success: false,
      error: 'Archivo demasiado grande (máx 100MB)'
    }
  }

  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'audio/mpeg',
    'audio/wav',
    'audio/ogg',
    'audio/webm',
    'video/mp4',
    'video/webm',
    'video/ogg',
    'application/zip',
    'application/x-rar-compressed'
  ]

  if (!allowedTypes.includes(file.type)) {
    return {
      success: false,
      error: 'Tipo de archivo no permitido'
    }
  }

  try {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(7)
    const extension = file.name.split('.').pop() || 'bin'
    const fileName = `${timestamp}-${random}.${extension}`

    const uploadsDir = join(process.cwd(), 'public', 'uploads')
    const filePath = join(uploadsDir, fileName)

    await mkdir(uploadsDir, { recursive: true })

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    const fileUrl = `/uploads/${fileName}`
    const fileRecord = await prisma.file.create({
      data: {
        name: fileName,
        originalName: file.name,
        path: filePath,
        url: fileUrl,
        type: file.type.split('/')[0],
        mimeType: file.type,
        sizeInBytes: BigInt(file.size),
        userId: uploadedBy
      }
    })

    return {
      success: true,
      data: {
        id: fileRecord.id,
        url: fileUrl,
        name: file.name
      }
    }
  } catch (_error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al subir archivo'
    }
  }
}

export async function updateContentPositions(
  updates: { id: string; position: number }[],
  courseId: string
): Promise<ActionResponse> {
  try {
    await prisma.$transaction(
      updates.map((update) =>
        prisma.lessonContent.update({
          where: { id: update.id },
          data: { position: update.position }
        })
      )
    )

    revalidatePath(`/instructor/courses/${courseId}?step=content`)

    return {
      success: true
    }
  } catch (_error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error actualizando posiciones'
    }
  }
}
