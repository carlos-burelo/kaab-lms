import { createCourseBasicInfo, getCategories, updateCourseBasicInfo } from '@/actions/courseActions'
import { CourseInfoFormClient } from './CourseInfoFormClient'
import type { CourseForm } from './types'

export async function CourseInfoForm({ isNew, course }: CourseForm) {
  const categoriesResponse = await getCategories()
  const categories = categoriesResponse.success ? categoriesResponse.data || [] : []
  const action = isNew ? createCourseBasicInfo : updateCourseBasicInfo

  return <CourseInfoFormClient isNew={isNew} course={course} categories={categories} action={action} />
}
