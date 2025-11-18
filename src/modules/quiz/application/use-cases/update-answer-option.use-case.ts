/**
 * Update Answer Option Use Case
 * Updates an existing answer option
 */

import { BaseUseCase } from '@/core/shared/use-case.interface';
import { Result } from '@/core/shared/result';
import { prisma } from '@/lib/prisma';

interface UpdateAnswerOptionRequest {
  optionId: string;
  data: {
    text?: string;
    isCorrect?: boolean;
    position?: number;
  };
  currentUserId: string;
}

interface AnswerOptionDTO {
  id: string;
  questionId: string;
  text: string;
  isCorrect: boolean;
  position: number;
}

export class UpdateAnswerOptionUseCase extends BaseUseCase<
  UpdateAnswerOptionRequest,
  AnswerOptionDTO
> {
  async execute(request: UpdateAnswerOptionRequest): Promise<Result<AnswerOptionDTO>> {
    const { optionId, data } = request;

    try {
      const option = await prisma.quizAnswerOption.update({
        where: { id: optionId },
        data,
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
        new Error(`Failed to update answer option: ${(error as Error).message}`)
      );
    }
  }
}
