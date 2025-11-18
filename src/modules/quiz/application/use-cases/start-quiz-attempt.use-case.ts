/**
 * Start Quiz Attempt Use Case
 * Starts a new quiz attempt for a student
 */

import { BaseUseCase } from '@/core/shared/use-case.interface';
import { Result } from '@/core/shared/result';
import { prisma } from '@/lib/prisma';

interface StartQuizAttemptRequest {
  userId: string;
  quizId: string;
}

interface QuizAttemptDTO {
  id: string;
  userId: string;
  quizId: string;
  attemptNumber: number;
  startedAt: Date;
}

export class StartQuizAttemptUseCase extends BaseUseCase<
  StartQuizAttemptRequest,
  QuizAttemptDTO
> {
  async execute(request: StartQuizAttemptRequest): Promise<Result<QuizAttemptDTO>> {
    const { userId, quizId } = request;

    try {
      const quiz = await prisma.quiz.findUnique({
        where: { id: quizId },
      });

      if (!quiz) {
        return Result.fail(new Error('Quiz not found'));
      }

      // Check max attempts
      if (quiz.maxAttempts) {
        const attemptCount = await prisma.quizAttempt.count({
          where: { userId, quizId },
        });

        if (attemptCount >= quiz.maxAttempts) {
          return Result.fail(
            new Error(`Maximum attempts (${quiz.maxAttempts}) reached`)
          );
        }
      }

      // Get next attempt number
      const nextAttemptNumber = await prisma.quizAttempt.count({
        where: { userId, quizId },
      }) + 1;

      // Create attempt
      const attempt = await prisma.quizAttempt.create({
        data: {
          userId,
          quizId,
          attemptNumber: nextAttemptNumber,
          startedAt: new Date(),
        },
      });

      return Result.ok({
        id: attempt.id,
        userId: attempt.userId,
        quizId: attempt.quizId,
        attemptNumber: attempt.attemptNumber,
        startedAt: attempt.startedAt,
      });
    } catch (error) {
      return Result.fail(
        new Error(`Failed to start quiz attempt: ${(error as Error).message}`)
      );
    }
  }
}
