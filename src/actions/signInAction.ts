'use server'

import { UserRole } from '@prisma/client'
import { redirect } from 'next/navigation'
import { getSession, signIn as nextAuthSignIn, signOut as nextAuthSignOut } from '@/lib/auth'

export async function signIn(formData: FormData) {
  const email = formData.get('email')?.toString()
  const contrasena = formData.get('contrasena')?.toString()

  try {
    await nextAuthSignIn('credentials', {
      redirect: false,
      email,
      contrasena
    })
  } catch (e) {
    return JSON.stringify(e)
  }

  const user = await getSession()
  if (!user) return 'Credenciales inválidas'

  const rol: UserRole = user.role || UserRole.STUDENT

  switch (rol) {
    case UserRole.ADMIN:
      redirect('/administrador')
    case UserRole.INSTRUCTOR:
      redirect('/instructor')
    default:
      redirect('/estudiante')
  }
}

export async function signOut() {
  await nextAuthSignOut({ redirect: false })
  redirect('/sign-in')
}
