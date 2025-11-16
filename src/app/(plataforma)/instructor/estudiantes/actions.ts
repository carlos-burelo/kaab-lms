'use server'
import type { UserRole } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { updateUserSchema } from './schemas'

export async function updateUser(userId: string, data: unknown) {
  const result = updateUserSchema.safeParse(data)

  if (!result.success) {
    const errorMessages = result.error.issues.map((e) => e.message).join(', ')
    return { success: false, error: `Datos inválidos: ${errorMessages}` }
  }

  try {
    await prisma.user.update({ where: { id: userId }, data: result.data })
    revalidatePath('/admin/estudiantes')
    return { success: true }
  } catch (error) {
    console.error(error)
    if (
      error instanceof Object &&
      'code' in error &&
      error.code === 'P2002' &&
      'meta' in error &&
      error.meta instanceof Object &&
      'target' in error.meta &&
      Array.isArray(error.meta.target) &&
      error.meta.target.includes('email')
    ) {
      return { success: false, error: 'Este email ya está en uso.' }
    }
    return { success: false, error: 'No se pudo actualizar el usuario.' }
  }
}

export async function updateUserRole(userId: string, newRole: UserRole) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { role: newRole }
    })

    revalidatePath('/admin/estudiantes')
    return { success: true }
  } catch (error) {
    console.error(error)
    return { success: false, error: 'No se pudo actualizar el rol.' }
  }
}

export async function deleteUser(userId: string) {
  try {
    await prisma.user.delete({
      where: { id: userId }
    })

    revalidatePath('/admin/estudiantes')
    return { success: true }
  } catch (error) {
    console.error(error)
    return { success: false, error: 'No se pudo eliminar el usuario.' }
  }
}

export async function deleteMultipleUsers(userIds: string[]) {
  if (userIds.length === 0) {
    return { success: false, error: 'No se seleccionaron usuarios.' }
  }

  try {
    await prisma.user.deleteMany({
      where: {
        id: {
          in: userIds
        }
      }
    })

    revalidatePath('/admin/estudiantes')
    return { success: true }
  } catch (error) {
    console.error(error)
    return { success: false, error: 'No se pudieron eliminar los usuarios.' }
  }
}
