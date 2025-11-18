'use server'

import { revalidatePath } from 'next/cache'
import z from 'zod'
import { userRepository } from '@/database/repositories'
import { getSession } from '@/lib/auth'

// ============================================================================
// SCHEMAS - VALIDACIÓN
// ============================================================================

const UpdateProfileSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100, 'Máximo 100 caracteres'),
  bio: z.string().max(500, 'Máximo 500 caracteres').optional(),
  socialLinks: z
    .object({
      facebook: z.string().url('URL inválida').optional().or(z.literal('')),
      twitter: z.string().url('URL inválida').optional().or(z.literal('')),
      linkedin: z.string().url('URL inválida').optional().or(z.literal('')),
      github: z.string().url('URL inválida').optional().or(z.literal('')),
      website: z.string().url('URL inválida').optional().or(z.literal(''))
    })
    .optional()
})

const UpdateProfileImageSchema = z.object({
  imageUrl: z.string().url('URL inválida')
})

// ============================================================================
// OBTENER PERFIL
// ============================================================================

export async function getProfile() {
  try {
    const user = await getSession()
    if (!user?.id) {
      throw new Error('No autenticado')
    }

    const profile = await userRepository.getProfile(user.id)
    return { success: true, data: profile }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al obtener perfil'
    return { success: false, error: message }
  }
}

// ============================================================================
// ACTUALIZAR PERFIL
// ============================================================================

export async function updateProfile(data: z.infer<typeof UpdateProfileSchema>) {
  try {
    const user = await getSession()
    if (!user?.id) {
      throw new Error('No autenticado')
    }

    const validated = UpdateProfileSchema.parse(data)

    // Clean up social links - remove empty strings
    const socialLinks = validated.socialLinks
      ? Object.fromEntries(Object.entries(validated.socialLinks).filter(([_, value]) => value && value !== ''))
      : undefined

    const updated = await userRepository.updateProfile(user.id, {
      name: validated.name,
      bio: validated.bio,
      socialLinks
    })

    revalidatePath('/estudiante/perfil')
    revalidatePath('/estudiante')
    return { success: true, data: updated }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    const message = error instanceof Error ? error.message : 'Error al actualizar perfil'
    return { success: false, error: message }
  }
}

// ============================================================================
// ACTUALIZAR IMAGEN DE PERFIL
// ============================================================================

export async function updateProfileImage(imageUrl: string) {
  try {
    const user = await getSession()
    if (!user?.id) {
      throw new Error('No autenticado')
    }

    const validated = UpdateProfileImageSchema.parse({ imageUrl })

    const updated = await userRepository.updateProfile(user.id, {
      imageUrl: validated.imageUrl
    })

    revalidatePath('/estudiante/perfil')
    revalidatePath('/estudiante')
    return { success: true, data: updated }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    const message = error instanceof Error ? error.message : 'Error al actualizar imagen'
    return { success: false, error: message }
  }
}

// ============================================================================
// OBTENER ESTADÍSTICAS DE APRENDIZAJE
// ============================================================================

export async function getLearningStats() {
  try {
    const user = await getSession()
    if (!user?.id) {
      throw new Error('No autenticado')
    }

    const [
      enrolledCourses,
      completedCourses,
      certificates,
      quizAttempts,
      gamificationProfile
    ] = await Promise.all([
      userRepository.getEnrollments(user.id),
      userRepository.getCompletedCourses(user.id),
      userRepository.getCertificates(user.id),
      userRepository.getQuizAttempts(user.id),
      userRepository.getGamificationProfile(user.id)
    ])

    const stats = {
      totalCourses: enrolledCourses?.length || 0,
      completedCourses: completedCourses?.length || 0,
      certificates: certificates?.length || 0,
      totalQuizzes: quizAttempts?.length || 0,
      passedQuizzes: quizAttempts?.filter((a: any) => a.passed).length || 0,
      xp: gamificationProfile?.xp || 0,
      level: gamificationProfile?.level || 1,
      coins: gamificationProfile?.coins || 0,
      badges: 0, // Will be calculated
      achievements: 0 // Will be calculated
    }

    return { success: true, data: stats }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al obtener estadísticas'
    return { success: false, error: message }
  }
}
