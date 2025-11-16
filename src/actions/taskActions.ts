'use server'

import type { CheckedState } from '@radix-ui/react-checkbox'
import { revalidatePath } from 'next/cache'
import z from 'zod'
import { prisma } from '@/database/client'
import { getSession } from '@/lib/auth'

const CREATE_TASK_SCHEMA = z.object({
  title: z.string().min(1, 'El título es obligatorio'),
  description: z.string().min(1, 'La descripción es obligatoria'),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELED']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  dueDate: z.coerce.date({
    error: 'Invalid date format'
  })
})

export async function createTaskAction(formData: FormData) {
  const session = await getSession()
  if (!session?.id) {
    throw new Error('No autenticado')
  }

  const parsed = CREATE_TASK_SCHEMA.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    throw new Error('Invalid data', { cause: parsed.error })
  }

  const taskData = parsed.data
  await prisma.personalTask.create({
    data: {
      ...taskData,
      userId: session.id
    }
  })

  revalidatePath('/instructor')
}

export async function completeTaskAction(taskId: string, state: CheckedState) {
  await prisma.personalTask.update({
    where: { id: taskId },
    data: {
      status: state ? 'COMPLETED' : 'PENDING',
      completedAt: state ? new Date() : null
    }
  })
  revalidatePath('/instructor')
}

export async function deleteTaskAction(taskId: string) {
  await prisma.personalTask.delete({
    where: { id: taskId }
  })
  revalidatePath('/instructor')
}
