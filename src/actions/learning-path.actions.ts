'use server'

import { revalidatePath } from 'next/cache'
import z from 'zod'
import { instructorRepository, userRepository } from '@/database/repositories'
import { getSession } from '@/lib/auth'

// ============================================================================
// SCHEMAS - VALIDACIÓN
// ============================================================================

const GetLearningPathSchema = z.object({
  learningPathId: z.string().min(1, 'El ID de la ruta es requerido')
})

const StartLearningPathSchema = z.object({
  learningPathId: z.string().min(1)
})

const CompleteNodeSchema = z.object({
  learningPathId: z.string().min(1),
  nodeId: z.string().min(1),
  completionData: z.record(z.string(), z.any()).optional()
})

const GetNextNodeSchema = z.object({
  learningPathId: z.string().min(1),
  currentNodeId: z.string().min(1),
  completionData: z.record(z.string(), z.any()).optional()
})

// ============================================================================
// OBTENER RUTA DE APRENDIZAJE
// ============================================================================

export async function getLearningPath(learningPathId: string) {
  try {
    const validated = GetLearningPathSchema.parse({ learningPathId })

    const learningPath = await instructorRepository.getLearningPathDetail(validated.learningPathId, '')
    if (!learningPath) {
      throw new Error('Ruta de aprendizaje no encontrada')
    }

    return { success: true, data: learningPath }
  } catch (_error) {
    const message = error instanceof Error ? error.message : 'Error al obtener ruta'
    return { success: false, error: message }
  }
}

// ============================================================================
// INICIAR RUTA DE APRENDIZAJE
// ============================================================================

export async function startLearningPath(learningPathId: string) {
  try {
    const user = await getSession()
    if (!user?.id) {
      throw new Error('No autenticado')
    }

    const validated = StartLearningPathSchema.parse({ learningPathId })

    // Verificar que la ruta existe
    const learningPath = await instructorRepository.getLearningPathDetail(validated.learningPathId, '')
    if (!learningPath) {
      throw new Error('Ruta de aprendizaje no encontrada')
    }

    // Crear registro de progreso del estudiante en la ruta
    const progress = await userRepository.createLearningPathProgress({
      userId: user.id,
      learningPathId: validated.learningPathId,
      currentNodeId: learningPath.nodes?.find((n: any) => n.nodeType === 'START')?.id || null,
      completedNodes: [],
      status: 'IN_PROGRESS'
    })

    revalidatePath('/estudiante')
    return { success: true, data: progress }
  } catch (_error) {
    const message = error instanceof Error ? error.message : 'Error al iniciar ruta'
    return { success: false, error: message }
  }
}

// ============================================================================
// COMPLETAR NODO DE RUTA
// ============================================================================

export async function completeNode(data: z.infer<typeof CompleteNodeSchema>) {
  try {
    const user = await getSession()
    if (!user?.id) {
      throw new Error('No autenticado')
    }

    const validated = CompleteNodeSchema.parse(data)

    // Obtener progreso actual
    const progress = await userRepository.getLearningPathProgress(validated.learningPathId, user.id)
    if (!progress) {
      throw new Error('Progreso no encontrado')
    }

    // Obtener nodo
    const learningPath = await instructorRepository.getLearningPathDetail(validated.learningPathId, '')
    const node = learningPath?.nodes?.find((n: any) => n.id === validated.nodeId)
    if (!node) {
      throw new Error('Nodo no encontrado')
    }

    // Actualizar progreso - marcar nodo como completado
    const completedNodes = progress.completedNodes || []
    if (!completedNodes.includes(validated.nodeId)) {
      completedNodes.push(validated.nodeId)
    }

    const updated = await userRepository.updateLearningPathProgress(validated.learningPathId, user.id, {
      completedNodes,
      lastCompletedAt: new Date(),
      completionData: validated.completionData
    })

    revalidatePath('/estudiante')
    return { success: true, data: updated }
  } catch (_error) {
    const message = error instanceof Error ? error.message : 'Error al completar nodo'
    return { success: false, error: message }
  }
}

// ============================================================================
// OBTENER SIGUIENTE NODO
// ============================================================================

export async function getNextNode(data: z.infer<typeof GetNextNodeSchema>) {
  try {
    const user = await getSession()
    if (!user?.id) {
      throw new Error('No autenticado')
    }

    const validated = GetNextNodeSchema.parse(data)

    // Obtener ruta
    const learningPath = await instructorRepository.getLearningPathDetail(validated.learningPathId, '')
    if (!learningPath) {
      throw new Error('Ruta no encontrada')
    }

    // Obtener nodo actual
    const currentNode = learningPath.nodes?.find((n: any) => n.id === validated.currentNodeId)
    if (!currentNode) {
      throw new Error('Nodo actual no encontrado')
    }

    // Obtener aristas salientes del nodo actual
    const outgoingEdges = learningPath.edges?.filter((e: any) => e.sourceNodeId === validated.currentNodeId) || []

    if (outgoingEdges.length === 0) {
      // Es un nodo final
      return { success: true, data: { nextNode: null, isCompleted: true } }
    }

    if (outgoingEdges.length === 1) {
      // Camino lineal
      const nextNodeId = outgoingEdges[0].targetNodeId
      const nextNode = learningPath.nodes?.find((n: any) => n.id === nextNodeId)
      return { success: true, data: { nextNode, isCompleted: false } }
    }

    // Múltiples caminos - evaluar condiciones
    for (const edge of outgoingEdges) {
      const nextNode = learningPath.nodes?.find((n: any) => n.id === edge.targetNodeId)

      // Verificar si la condición se cumple
      if (edge.condition) {
        const conditionMet = evaluateCondition(edge.condition, validated.completionData || {})
        if (conditionMet) {
          return { success: true, data: { nextNode, isCompleted: false } }
        }
      } else {
        // Sin condición específica, tomar el primer camino disponible
        return { success: true, data: { nextNode, isCompleted: false } }
      }
    }

    // Si ninguna condición se cumple, retornar null
    return { success: true, data: { nextNode: null, isCompleted: true } }
  } catch (_error) {
    const message = error instanceof Error ? error.message : 'Error al obtener siguiente nodo'
    return { success: false, error: message }
  }
}

// ============================================================================
// OBTENER PROGRESO DE RUTA
// ============================================================================

export async function getLearningPathProgress(learningPathId: string) {
  try {
    const user = await getSession()
    if (!user?.id) {
      throw new Error('No autenticado')
    }

    const progress = await userRepository.getLearningPathProgress(learningPathId, user.id)
    if (!progress) {
      throw new Error('Progreso no encontrado')
    }

    return { success: true, data: progress }
  } catch (_error) {
    const message = error instanceof Error ? error.message : 'Error al obtener progreso'
    return { success: false, error: message }
  }
}

// ============================================================================
// OBTENER RUTAS DISPONIBLES PARA ESTUDIANTE
// ============================================================================

export async function getAvailableLearningPaths() {
  try {
    const user = await getSession()
    if (!user?.id) {
      throw new Error('No autenticado')
    }

    const paths = await userRepository.getAvailableLearningPaths(user.id)
    return { success: true, data: paths }
  } catch (_error) {
    const message = error instanceof Error ? error.message : 'Error al obtener rutas'
    return { success: false, error: message }
  }
}

// ============================================================================
// OBTENER RUTAS EN PROGRESO
// ============================================================================

export async function getMyLearningPathsInProgress() {
  try {
    const user = await getSession()
    if (!user?.id) {
      throw new Error('No autenticado')
    }

    const paths = await userRepository.getStudentLearningPathsInProgress(user.id)
    return { success: true, data: paths }
  } catch (_error) {
    const message = error instanceof Error ? error.message : 'Error al obtener rutas'
    return { success: false, error: message }
  }
}

// ============================================================================
// HELPER: Evaluar condiciones de nodo de decisión
// ============================================================================

function evaluateCondition(condition: string, data: Record<string, any>): boolean {
  try {
    // Condiciones simples basadas en datos de completación
    // Formato: "score > 80" o "attempts < 3"
    // Esto es un ejemplo simple - en producción usar un evaluador más robusto

    if (condition.includes('score')) {
      const score = data.score || 0
      if (condition.includes('>')) {
        const threshold = Number.parseInt(condition.split('>')[1], 10)
        return score > threshold
      }
      if (condition.includes('<')) {
        const threshold = Number.parseInt(condition.split('<')[1], 10)
        return score < threshold
      }
      if (condition.includes('>=')) {
        const threshold = Number.parseInt(condition.split('>=')[1], 10)
        return score >= threshold
      }
      if (condition.includes('<=')) {
        const threshold = Number.parseInt(condition.split('<=')[1], 10)
        return score <= threshold
      }
      if (condition.includes('==')) {
        const threshold = Number.parseInt(condition.split('==')[1], 10)
        return score === threshold
      }
    }

    if (condition.includes('attempts')) {
      const attempts = data.attempts || 0
      if (condition.includes('>')) {
        const threshold = Number.parseInt(condition.split('>')[1], 10)
        return attempts > threshold
      }
      if (condition.includes('<')) {
        const threshold = Number.parseInt(condition.split('<')[1], 10)
        return attempts < threshold
      }
    }

    if (condition.includes('completed')) {
      return data.completed === true
    }

    // Si no se puede evaluar, retornar true
    return true
  } catch (_error) {
    console.error('Error evaluating condition:', error)
    return false
  }
}
