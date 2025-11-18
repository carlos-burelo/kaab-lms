/**
 * Quiz Mapper
 */

import { Mapper } from '@/core/shared/mapper.interface';
import { Quiz, QuizProps } from '../domain/quiz.entity';
import type { Quiz as PrismaQuiz } from '@prisma/client';

export interface QuizDTO {
  id: string;
  title: string;
  description?: string;
  instructions?: string;
  lessonId: string;
  durationMinutes?: number;
  passingScore: number;
  maxAttempts?: number;
  showAnswers: boolean;
  shuffleQuestions: boolean;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

class QuizMapper implements Mapper<Quiz, PrismaQuiz, QuizDTO> {
  toDomain(raw: PrismaQuiz): Quiz {
    const props: QuizProps = {
      title: raw.title,
      description: raw.description || undefined,
      instructions: raw.instructions || undefined,
      lessonId: raw.lessonId,
      durationMinutes: raw.durationMinutes || undefined,
      passingScore: Number(raw.passingScore),
      maxAttempts: raw.maxAttempts || undefined,
      showAnswers: raw.showAnswers,
      shuffleQuestions: raw.shuffleQuestions,
      isPublished: false, // Not in Prisma schema, default to false
      id: raw.id,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };

    // Use factory method instead of direct instantiation
    const result = Quiz.create(props);
    if (result.isFailure) {
      throw new Error(`Failed to create Quiz entity: ${result.error.message}`);
    }

    return result.value;
  }

  toPersistence(entity: Quiz): Omit<PrismaQuiz, 'createdAt' | 'updatedAt'> {
    return {
      id: entity.id,
      title: entity.title,
      description: entity.description || null,
      instructions: entity.instructions || null,
      lessonId: entity.lessonId,
      durationMinutes: entity.durationMinutes || null,
      passingScore: entity.passingScore,
      maxAttempts: entity.maxAttempts || null,
      showAnswers: entity.showAnswers,
      shuffleQuestions: entity.shuffleQuestions,
    };
  }

  toDTO(entity: Quiz): QuizDTO {
    return {
      id: entity.id,
      title: entity.title,
      description: entity.description,
      instructions: entity.instructions,
      lessonId: entity.lessonId,
      durationMinutes: entity.durationMinutes,
      passingScore: entity.passingScore,
      maxAttempts: entity.maxAttempts,
      showAnswers: entity.showAnswers,
      shuffleQuestions: entity.shuffleQuestions,
      isPublished: entity.isPublished,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}

export const quizMapper = new QuizMapper();
