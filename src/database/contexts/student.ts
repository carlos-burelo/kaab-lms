'use server'

import { studentRepository } from '@/database/repositories'
import { getSession } from '@/lib/auth'

export async function getEnrolledCourses() {
  const session = await getSession()
  if (!session?.id) throw new Error('No authenticated user found')
  return await studentRepository.getEnrolledCourses(session.id)
}
