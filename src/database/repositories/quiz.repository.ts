/**
 * Quiz Repository
 * Centraliza todas las consultas relacionadas con quizzes
 */
import { BaseRepository } from './base.repository'

export class QuizRepository extends BaseRepository {
  /**
   * Obtiene un quiz completo con todas sus preguntas y opciones
   */
  async getById(quizId: string) {
    try {
      return await this.client.quiz.findUnique({
        where: { id: quizId },
        include: {
          lesson: { include: { module: { include: { course: true } } } },
          questions: {
            include: { options: true, file: true },
            orderBy: { position: 'asc' }
          },
          attempts: {
            include: { userAnswers: true },
            orderBy: { createdAt: 'desc' }
          }
        }
      })
    } catch (error) {
      this.handleError(error, 'QuizRepository.getById')
    }
  }

  /**
   * Obtiene un quiz por lessonId (debe ser único)
   */
  async getByLessonId(lessonId: string) {
    try {
      return await this.client.quiz.findUnique({
        where: { lessonId },
        include: {
          lesson: true,
          questions: {
            include: { options: true, file: true },
            orderBy: { position: 'asc' }
          }
        }
      })
    } catch (error) {
      this.handleError(error, 'QuizRepository.getByLessonId')
    }
  }

  /**
   * Obtiene todos los quizzes de un curso (a través de lecciones)
   */
  async getByCourseId(courseId: string) {
    try {
      return await this.client.quiz.findMany({
        where: {
          lesson: {
            module: { courseId }
          }
        },
        include: {
          lesson: {
            include: { module: true }
          },
          questions: { select: { id: true } },
          _count: { select: { questions: true, attempts: true } }
        },
        orderBy: { createdAt: 'desc' }
      })
    } catch (error) {
      this.handleError(error, 'QuizRepository.getByCourseId')
    }
  }

  /**
   * Crea un nuevo quiz
   */
  async create(data: any) {
    try {
      return await this.client.quiz.create({
        data,
        include: {
          lesson: true,
          questions: { include: { options: true } }
        }
      })
    } catch (error) {
      this.handleError(error, 'QuizRepository.create')
    }
  }

  /**
   * Actualiza un quiz
   */
  async update(quizId: string, data: any) {
    try {
      return await this.client.quiz.update({
        where: { id: quizId },
        data,
        include: {
          lesson: true,
          questions: { include: { options: true } }
        }
      })
    } catch (error) {
      this.handleError(error, 'QuizRepository.update')
    }
  }

  /**
   * Elimina un quiz
   */
  async delete(quizId: string) {
    try {
      return await this.client.quiz.delete({
        where: { id: quizId }
      })
    } catch (error) {
      this.handleError(error, 'QuizRepository.delete')
    }
  }

  /**
   * Obtiene las preguntas de un quiz para mostrar al estudiante
   */
  async getQuestionsForStudent(quizId: string, shuffleQuestions: boolean) {
    try {
      let questions = await this.client.question.findMany({
        where: { quizId },
        include: {
          options: {
            select: { id: true, text: true, position: true }
          },
          file: true
        },
        orderBy: { position: 'asc' }
      })

      if (shuffleQuestions) {
        questions = questions.sort(() => Math.random() - 0.5)
      }

      return questions
    } catch (error) {
      this.handleError(error, 'QuizRepository.getQuestionsForStudent')
    }
  }

  /**
   * Crea un intento de quiz
   */
  async createAttempt(userId: string, quizId: string, attemptNumber: number) {
    try {
      return await this.client.userQuizAttempt.create({
        data: {
          userId,
          quizId,
          attemptNumber,
          maxScore: await this.getMaxScore(quizId)
        },
        include: { userAnswers: true }
      })
    } catch (error) {
      this.handleError(error, 'QuizRepository.createAttempt')
    }
  }

  /**
   * Guarda una respuesta del usuario
   */
  async saveAnswer(data: any) {
    try {
      return await this.client.userAnswer.create({
        data,
        include: { selectedOption: true, question: true }
      })
    } catch (error) {
      this.handleError(error, 'QuizRepository.saveAnswer')
    }
  }

  /**
   * Completa un intento de quiz
   */
  async completeAttempt(attemptId: string, score: number, passed: boolean) {
    try {
      return await this.client.userQuizAttempt.update({
        where: { id: attemptId },
        data: {
          score,
          passed,
          completedAt: new Date()
        },
        include: {
          userAnswers: {
            include: { question: true, selectedOption: true }
          }
        }
      })
    } catch (error) {
      this.handleError(error, 'QuizRepository.completeAttempt')
    }
  }

  /**
   * Obtiene los intentos anteriores de un usuario en un quiz
   */
  async getUserAttempts(userId: string, quizId: string) {
    try {
      return await this.client.userQuizAttempt.findMany({
        where: { userId, quizId },
        include: {
          userAnswers: {
            include: { question: true, selectedOption: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    } catch (error) {
      this.handleError(error, 'QuizRepository.getUserAttempts')
    }
  }

  /**
   * Obtiene el número de intentos de un usuario
   */
  async getUserAttemptCount(userId: string, quizId: string) {
    try {
      return await this.client.userQuizAttempt.count({
        where: { userId, quizId }
      })
    } catch (error) {
      this.handleError(error, 'QuizRepository.getUserAttemptCount')
      return 0
    }
  }

  /**
   * Obtiene la puntuación máxima de un quiz
   */
  private async getMaxScore(quizId: string): Promise<number> {
    try {
      const questions = await this.client.question.findMany({
        where: { quizId },
        select: { points: true }
      })
      return questions.reduce((sum, q) => sum + q.points, 0)
    } catch {
      return 0
    }
  }

  /**
   * Crea una pregunta para el quiz
   */
  async createQuestion(data: any) {
    try {
      return await this.client.question.create({
        data,
        include: { options: true }
      })
    } catch (error) {
      this.handleError(error, 'QuizRepository.createQuestion')
    }
  }

  /**
   * Actualiza una pregunta
   */
  async updateQuestion(questionId: string, data: any) {
    try {
      return await this.client.question.update({
        where: { id: questionId },
        data,
        include: { options: true }
      })
    } catch (error) {
      this.handleError(error, 'QuizRepository.updateQuestion')
    }
  }

  /**
   * Elimina una pregunta
   */
  async deleteQuestion(questionId: string) {
    try {
      return await this.client.question.delete({
        where: { id: questionId }
      })
    } catch (error) {
      this.handleError(error, 'QuizRepository.deleteQuestion')
    }
  }

  /**
   * Crea opciones de respuesta
   */
  async createAnswerOption(data: any) {
    try {
      return await this.client.answerOption.create({
        data
      })
    } catch (error) {
      this.handleError(error, 'QuizRepository.createAnswerOption')
    }
  }

  /**
   * Actualiza una opción de respuesta
   */
  async updateAnswerOption(optionId: string, data: any) {
    try {
      return await this.client.answerOption.update({
        where: { id: optionId },
        data
      })
    } catch (error) {
      this.handleError(error, 'QuizRepository.updateAnswerOption')
    }
  }

  /**
   * Elimina una opción de respuesta
   */
  async deleteAnswerOption(optionId: string) {
    try {
      return await this.client.answerOption.delete({
        where: { id: optionId }
      })
    } catch (error) {
      this.handleError(error, 'QuizRepository.deleteAnswerOption')
    }
  }
}

export const quizRepository = new QuizRepository()
