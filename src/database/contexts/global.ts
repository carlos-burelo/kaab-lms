'use server'

import { prisma } from '@/database/client'

export async function verifyAccount(email: string) {
  const user = await prisma.user.findUnique({
    where: { email: email.toString() },
    select: { id: true, email: true, password: true, role: true, profile: { select: { name: true, imageUrl: true } } }
  })
  return user
}
