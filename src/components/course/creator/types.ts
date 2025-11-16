import type { getCourseById } from '@/actions/courseActions'

type CourseResponse = Awaited<ReturnType<typeof getCourseById>>
export type DetallesDelCurso = NonNullable<CourseResponse['data']>

export interface CourseForm {
  isNew: boolean
  course: DetallesDelCurso | null
}
