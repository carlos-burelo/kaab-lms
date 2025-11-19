/**
 * Enrollment Repository Interface
 */

import type { Repository } from '@/core/shared/repository.interface'
import type { Result } from '@/core/shared/result'
import type { Enrollment } from './enrollment.entity'

export interface IEnrollmentRepository extends Repository<Enrollment> {
  /**
   * Find enrollment by user and course
   */
  findByUserAndCourse(userId: string, courseId: string): Promise<Result<Enrollment | null>>

  /**
   * Find all enrollments by user
   */
  findByUser(userId: string): Promise<Result<Enrollment[]>>

  /**
   * Find all enrollments by course
   */
  findByCourse(courseId: string): Promise<Result<Enrollment[]>>

  /**
   * Check if user is enrolled in course
   */
  isUserEnrolled(userId: string, courseId: string): Promise<Result<boolean>>

  /**
   * Get course completion statistics
   */
  getCourseStats(courseId: string): Promise<
    Result<{
      totalEnrollments: number
      completedEnrollments: number
      averageProgress: number
      averageTimeMinutes: number
    }>
  >

  /**
   * Get user's learning statistics
   */
  getUserStats(userId: string): Promise<
    Result<{
      totalEnrollments: number
      completedCourses: number
      totalTimeMinutes: number
      averageProgress: number
    }>
  >
}
