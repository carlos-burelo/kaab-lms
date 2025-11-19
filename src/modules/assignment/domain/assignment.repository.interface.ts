/**
 * Assignment Repository Interface
 */

import type { Repository } from '@/core/shared/repository.interface'
import type { Result } from '@/core/shared/result'
import type { Assignment } from './assignment.entity'

export interface IAssignmentRepository extends Repository<Assignment> {
  /**
   * Find assignments by lesson ID
   */
  findByLesson(lessonId: string): Promise<Result<Assignment[]>>

  /**
   * Find assignment with submissions
   */
  findByIdWithSubmissions(id: string): Promise<Result<Assignment | null>>

  /**
   * Find user's submission for an assignment
   */
  findUserSubmission(
    assignmentId: string,
    userId: string
  ): Promise<
    Result<{
      id: string
      content?: string
      fileId?: string
      score?: number
      feedback?: string
      submittedAt: Date
      gradedAt?: Date
    } | null>
  >

  /**
   * Get assignment statistics
   */
  getAssignmentStats(assignmentId: string): Promise<
    Result<{
      totalSubmissions: number
      averageScore: number
      gradedCount: number
      pendingCount: number
    }>
  >
}
