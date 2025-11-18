/**
 * Create Answer Option Use Case
 * Creates a new answer option for a quiz question
 */

import { BaseUseCase } from '@/core/shared/use-case.interface';
import { Result } from '@/core/shared/result';
import { prisma } from '@/lib/prisma';

interface CreateAnswerOptionRequest {
  questionId: string;
  text: string;
  isCorrect: boolean;
  position: number;
  currentUserId: string;
}

interface AnswerOptionDTO {
  id: string;
  questionId: string;
  text: string;
  isCorrect: boolean;
  position: number;
}

export class CreateAnswerOptionUseCase extends BaseUseCase<
  CreateAnswerOptionRequest,
  AnswerOptionDTO
> {
  async execute(request: CreateAnswerOptionRequest): Promise<Result<AnswerOptionDTO>> {
    const { questionId, text, isCorrect, position } = request;

    try {
      // Verify question exists
      const question = await prisma.quizQuestion.findUnique({
        where: { id: questionId },
      });

      if (!question) {
        return Result.fail(new Error('Question not found'));
      }

      // Create answer option
      const option = await prisma.quizAnswerOption.create({
        data: {
          questionId,
          text,
          isCorrect,
          position,
        },
      });

      return Result.ok({
        id: option.id,
        questionId: option.questionId,
        text: option.text,
        isCorrect: option.isCorrect,
        position: option.position,
      });
    } catch (error) {
      return Result.fail(
        new Error(`Failed to create answer option: ${(error as Error).message}`)
      );
    }
  }
}
