'use server'

import { revalidatePath } from 'next/cache'
import z from 'zod'
import { userRepository } from '@/database/repositories'
import { getSession } from '@/lib/auth'

// ============================================================================
// SCHEMAS - VALIDACIÓN
// ============================================================================

const CreateTaskSchema = z.object({
  title: z.string().min(1, 'El título es requerido').max(200, 'Máximo 200 caracteres'),
  description: z.string().max(1000, 'Máximo 1000 caracteres').optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  dueDate: z
    .string()
    .or(z.date())
    .transform((val) => (typeof val === 'string' ? new Date(val) : val))
    .optional(),
  tags: z.array(z.string()).optional()
})

const UpdateTaskSchema = z.object({
  taskId: z.string().min(1),
  title: z.string().min(1, 'El título es requerido').max(200, 'Máximo 200 caracteres').optional(),
  description: z.string().max(1000, 'Máximo 1000 caracteres').optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  dueDate: z
    .string()
    .or(z.date())
    .transform((val) => (typeof val === 'string' ? new Date(val) : val))
    .optional()
    .nullable(),
  tags: z.array(z.string()).optional()
})

// ============================================================================
// OBTENER TAREAS PERSONALES
// ============================================================================

export async function getPersonalTasks() {
  try {
    const user = await getSession()
    if (!user?.id) {
      throw new Error('No autenticado')
    }

    const tasks = await userRepository.getPersonalTasks(user.id)
    return { success: true, data: tasks }
  } catch (_error) {
    const message = _error instanceof Error ? _error.message : 'Error al obtener tareas'
    return { success: false, error: message }
  }
}

// ============================================================================
// CREAR TAREA PERSONAL
// ============================================================================

export async function createPersonalTask(data: z.infer<typeof CreateTaskSchema>) {
  try {
    const user = await getSession()
    if (!user?.id) {
      throw new Error('No autenticado')
    }

    const validated = CreateTaskSchema.parse(data)

    const task = await userRepository.createPersonalTask({
      userId: user.id,
      title: validated.title,
      description: validated.description,
      priority: validated.priority,
      dueDate: validated.dueDate,
      tags: validated.tags
    })

    revalidatePath('/estudiante/tareas')
    return { success: true, data: task }
  } catch (_error) {
    if (_error instanceof z.ZodError) {
      return { success: false, error: _error.issues[0].message }
    }
    const message = _error instanceof Error ? _error.message : 'Error al crear tarea'
    return { success: false, error: message }
  }
}

// ============================================================================
// ACTUALIZAR TAREA PERSONAL
// ============================================================================

export async function updatePersonalTask(data: z.infer<typeof UpdateTaskSchema>) {
  try {
    const user = await getSession()
    if (!user?.id) {
      throw new Error('No autenticado')
    }

    const validated = UpdateTaskSchema.parse(data)

    // Verificar que la tarea pertenece al usuario
    const task = await userRepository.getPersonalTaskById(validated.taskId)
    if (!task || task.userId !== user.id) {
      throw new Error('No tienes permiso para modificar esta tarea')
    }

    const updateData: any = {}
    if (validated.title !== undefined) updateData.title = validated.title
    if (validated.description !== undefined) updateData.description = validated.description
    if (validated.status !== undefined) updateData.status = validated.status
    if (validated.priority !== undefined) updateData.priority = validated.priority
    if (validated.dueDate !== undefined) updateData.dueDate = validated.dueDate
    if (validated.tags !== undefined) updateData.tags = validated.tags

    // Handle task completion
    if (validated.status === 'COMPLETED' && task.status !== 'COMPLETED') {
      updateData.completedAt = new Date()
    } else if (validated.status !== 'COMPLETED' && task.status === 'COMPLETED') {
      updateData.completedAt = null
    }

    const updated = await userRepository.updatePersonalTask(validated.taskId, updateData)

    revalidatePath('/estudiante/tareas')
    return { success: true, data: updated }
  } catch (_error) {
    if (_error instanceof z.ZodError) {
      return { success: false, error: _error.issues[0].message }
    }
    const message = _error instanceof Error ? _error.message : 'Error al actualizar tarea'
    return { success: false, error: message }
  }
}

// ============================================================================
// TOGGLE COMPLETAR TAREA
// ============================================================================

export async function toggleTaskCompletion(taskId: string) {
  try {
    const user = await getSession()
    if (!user?.id) {
      throw new Error('No autenticado')
    }

    const task = await userRepository.getPersonalTaskById(taskId)
    if (!task || task.userId !== user.id) {
      throw new Error('No tienes permiso para modificar esta tarea')
    }

    const newStatus = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED'
    const completedAt = newStatus === 'COMPLETED' ? new Date() : null

    const updated = await userRepository.updatePersonalTask(taskId, {
      status: newStatus,
      completedAt
    })

    revalidatePath('/estudiante/tareas')
    return { success: true, data: updated }
  } catch (_error) {
    const message = _error instanceof Error ? _error.message : 'Error al actualizar tarea'
    return { success: false, error: message }
  }
}

// ============================================================================
// ELIMINAR TAREA PERSONAL
// ============================================================================

export async function deletePersonalTask(taskId: string) {
  try {
    const user = await getSession()
    if (!user?.id) {
      throw new Error('No autenticado')
    }

    const task = await userRepository.getPersonalTaskById(taskId)
    if (!task || task.userId !== user.id) {
      throw new Error('No tienes permiso para eliminar esta tarea')
    }

    await userRepository.deletePersonalTask(taskId)

    revalidatePath('/estudiante/tareas')
    return { success: true }
  } catch (_error) {
    const message = _error instanceof Error ? _error.message : 'Error al eliminar tarea'
    return { success: false, error: message }
  }
}
