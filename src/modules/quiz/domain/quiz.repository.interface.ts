/**
 * Quiz Repository Interface
 */

import { Repository } from '@/core/shared/repository.interface';
import { Result } from '@/core/shared/result';
import { Quiz } from './quiz.entity';

export interface IQuizRepository extends Repository<Quiz> {
  /**
   * Find quiz by lesson ID
   */
  findByLesson(lessonId: string): Promise<Result<Quiz | null>>;

  /**
   * Find all quizzes with questions
   */
  findByIdWithQuestions(id: string): Promise<Result<Quiz | null>>;

  /**
   * Check if lesson already has a quiz
   */
  lessonHasQuiz(lessonId: string): Promise<Result<boolean>>;

  /**
   * Get quiz statistics
   */
  getQuizStats(
    quizId: string
  ): Promise<
    Result<{
      totalAttempts: number;
      averageScore: number;
      passRate: number;
    }>
  >;
}
