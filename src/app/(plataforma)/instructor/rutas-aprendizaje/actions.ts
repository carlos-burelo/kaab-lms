'use server'

import { revalidatePath } from 'next/cache'
import { instructorRepository } from '@/database/repositories'
import { auth } from '@/lib/auth'
import type { DesignerEdge, DesignerNode } from '@/types/learning-path-designer'

export async function createLearningPath(data: {
  title: string
  slug: string
  description: string
  level: string
  estimatedDurationDays?: number
  instructorId: string
}) {
  try {
    const result = await instructorRepository.createLearningPath(data)
    if (result.success) {
      revalidatePath('/instructor/rutas-aprendizaje')
    }
    return result
  } catch (error) {
    console.error(error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}

export async function saveLearningPathDesign(learningPathId: string, nodes: DesignerNode[], edges: DesignerEdge[]) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      throw new Error('No autorizado')
    }

    await instructorRepository.saveLearningPathDesign(learningPathId, nodes, edges, session.user.email)

    revalidatePath(`/instructor/rutas-aprendizaje/${learningPathId}`)
    revalidatePath('/instructor/rutas-aprendizaje')

    return { success: true }
  } catch (error) {
    console.error(error)
    throw error
  }
}

export async function deleteLearningPath(learningPathId: string) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      throw new Error('No autorizado')
    }

    await instructorRepository.deleteLearningPath(learningPathId, session.user.email)

    revalidatePath('/instructor/rutas-aprendizaje')

    return { success: true }
  } catch (error) {
    console.error(error)
    throw error
  }
}
