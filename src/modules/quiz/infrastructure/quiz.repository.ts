/**
 * Quiz Repository Implementation
 */

import { Result } from '@/core/shared/result';
import { DatabaseError } from '@/core/shared/errors';
import { prisma } from '@/lib/prisma';
import { Quiz } from '../domain/quiz.entity';
import { IQuizRepository } from '../domain/quiz.repository.interface';
import { quizMapper } from './quiz.mapper';
import { eventBus } from '@/core/infrastructure/event-bus';

export class QuizRepository implements IQuizRepository {
  async findById(id: string): Promise<Result<Quiz | null>> {
    try {
      const quiz = await prisma.quiz.findUnique({
        where: { id },
      });

      if (!quiz) return Result.ok(null);

      return Result.ok(quizMapper.toDomain(quiz));
    } catch (error) {
      return Result.fail(
        new DatabaseError('Failed to find quiz', error as Error)
      );
    }
  }

  async findByIdWithQuestions(id: string): Promise<Result<Quiz | null>> {
    try {
      const quiz = await prisma.quiz.findUnique({
        where: { id },
        include: {
          questions: {
            include: {
              options: true,
            },
            orderBy: {
              position: 'asc',
            },
          },
        },
      });

      if (!quiz) return Result.ok(null);

      return Result.ok(quizMapper.toDomain(quiz));
    } catch (error) {
      return Result.fail(
        new DatabaseError('Failed to find quiz with questions', error as Error)
      );
    }
  }

  async findByLesson(lessonId: string): Promise<Result<Quiz | null>> {
    try {
      const quiz = await prisma.quiz.findUnique({
        where: { lessonId },
        include: {
          questions: {
            include: {
              options: true,
            },
            orderBy: {
              position: 'asc',
            },
          },
        },
      });

      if (!quiz) return Result.ok(null);

      return Result.ok(quizMapper.toDomain(quiz));
    } catch (error) {
      return Result.fail(
        new DatabaseError('Failed to find quiz by lesson', error as Error)
      );
    }
  }

  async save(entity: Quiz): Promise<Result<Quiz>> {
    try {
      const model = quizMapper.toPersistence(entity);

      const saved = await prisma.quiz.upsert({
        where: { id: entity.id },
        create: model,
        update: model,
      });

      // Publish domain events
      for (const event of entity.domainEvents) {
        await eventBus.publish(event);
      }
      entity.clearEvents();

      return Result.ok(quizMapper.toDomain(saved));
    } catch (error) {
      return Result.fail(
        new DatabaseError('Failed to save quiz', error as Error)
      );
    }
  }

  async delete(id: string): Promise<Result<void>> {
    try {
      await prisma.quiz.delete({
        where: { id },
      });

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(
        new DatabaseError('Failed to delete quiz', error as Error)
      );
    }
  }

  async exists(id: string): Promise<Result<boolean>> {
    try {
      const count = await prisma.quiz.count({
        where: { id },
      });

      return Result.ok(count > 0);
    } catch (error) {
      return Result.fail(
        new DatabaseError('Failed to check quiz existence', error as Error)
      );
    }
  }

  async lessonHasQuiz(lessonId: string): Promise<Result<boolean>> {
    try {
      const count = await prisma.quiz.count({
        where: { lessonId },
      });

      return Result.ok(count > 0);
    } catch (error) {
      return Result.fail(
        new DatabaseError('Failed to check lesson quiz', error as Error)
      );
    }
  }

  async getQuizStats(
    quizId: string
  ): Promise<
    Result<{
      totalAttempts: number;
      averageScore: number;
      passRate: number;
    }>
  > {
    try {
      const attempts = await prisma.userQuizAttempt.findMany({
        where: { quizId },
        select: {
          score: true,
          maxScore: true,
          passed: true,
        },
      });

      const totalAttempts = attempts.length;

      if (totalAttempts === 0) {
        return Result.ok({
          totalAttempts: 0,
          averageScore: 0,
          passRate: 0,
        });
      }

      const totalScore = attempts.reduce((sum, attempt) => {
        return sum + (attempt.score / attempt.maxScore) * 100;
      }, 0);

      const averageScore = totalScore / totalAttempts;

      const passedCount = attempts.filter((a) => a.passed).length;
      const passRate = (passedCount / totalAttempts) * 100;

      return Result.ok({
        totalAttempts,
        averageScore,
        passRate,
      });
    } catch (error) {
      return Result.fail(
        new DatabaseError('Failed to get quiz stats', error as Error)
      );
    }
  }
}
