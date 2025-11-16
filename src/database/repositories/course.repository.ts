/**
 * Course Repository
 * Centraliza todas las consultas relacionadas con cursos
 */
import { BaseRepository } from './base.repository'

export class CourseRepository extends BaseRepository {
  /**
   * Obtiene un curso con toda su información completa por ID
   */
  async getById(courseId: string) {
    try {
      return await this.client.course.findUnique({
        where: { id: courseId },
        include: {
          instructor: { include: { user: true } },
          category: true,
          image: true,
          tags: true,
          modules: {
            include: {
              lessons: {
                include: {
                  contents: { include: { file: true } },
                  attachments: { include: { file: true } },
                  quiz: {
                    include: {
                      questions: {
                        include: { options: true, file: true }
                      }
                    }
                  },
                  assignments: { include: { submissions: true } }
                }
              }
            },
            orderBy: { position: 'asc' }
          },
          enrollments: { include: { user: true } },
          reviews: { include: { user: true } },
          _count: {
            select: {
              enrollments: true,
              reviews: true,
              modules: true
            }
          }
        }
      })
    } catch (error) {
      this.handleError(error, 'CourseRepository.getById')
    }
  }

  /**
   * Obtiene un curso por slug (más eficiente que búsqueda por texto)
   */
  async getBySlug(slug: string) {
    try {
      return await this.client.course.findUnique({
        where: { slug },
        include: {
          instructor: { include: { user: true } },
          category: true,
          image: true,
          tags: true,
          modules: {
            include: {
              lessons: {
                include: {
                  contents: { include: { file: true } },
                  attachments: { include: { file: true } },
                  quiz: {
                    include: {
                      questions: {
                        include: { options: true, file: true }
                      }
                    }
                  },
                  assignments: { include: { submissions: true } }
                }
              }
            },
            orderBy: { position: 'asc' }
          },
          enrollments: { include: { user: true } },
          reviews: { include: { user: true } },
          _count: {
            select: {
              enrollments: true,
              reviews: true,
              modules: true
            }
          }
        }
      })
    } catch (error) {
      this.handleError(error, 'CourseRepository.getBySlug')
    }
  }

  /**
   * Obtiene cursos por categoría
   */
  async getByCategoryId(categoryId: string, limit = 20, skip = 0) {
    try {
      return await this.client.course.findMany({
        where: {
          categoryId,
          isPublished: true
        },
        include: {
          instructor: { include: { user: true } },
          category: true,
          image: true,
          _count: { select: { enrollments: true, reviews: true } }
        },
        take: limit,
        skip,
        orderBy: { createdAt: 'desc' }
      })
    } catch (error) {
      this.handleError(error, 'CourseRepository.getByCategoryId')
    }
  }

  /**
   * Busca cursos por término
   */
  async search(term: string, limit = 20, skip = 0) {
    try {
      return await this.client.course.findMany({
        where: {
          isPublished: true,
          OR: [{ title: { contains: term } }, { description: { contains: term } }]
        },
        include: {
          instructor: { include: { user: true } },
          category: true,
          image: true,
          _count: { select: { enrollments: true, reviews: true } }
        },
        take: limit,
        skip,
        orderBy: { createdAt: 'desc' }
      })
    } catch (error) {
      this.handleError(error, 'CourseRepository.search')
    }
  }

  /**
   * Obtiene cursos destacados
   */
  async getFeatured(limit = 10) {
    try {
      return await this.client.course.findMany({
        where: {
          isPublished: true,
          isFeatured: true
        },
        include: {
          instructor: { include: { user: true } },
          category: true,
          image: true,
          _count: { select: { enrollments: true, reviews: true } }
        },
        take: limit,
        orderBy: { rating: 'desc' }
      })
    } catch (error) {
      this.handleError(error, 'CourseRepository.getFeatured')
    }
  }

  /**
   * Obtiene los mejores cursos por rating
   */
  async getTopRated(limit = 10) {
    try {
      return await this.client.course.findMany({
        where: { isPublished: true },
        include: {
          instructor: { include: { user: true } },
          category: true,
          image: true,
          _count: { select: { enrollments: true, reviews: true } }
        },
        take: limit,
        orderBy: { rating: 'desc' }
      })
    } catch (error) {
      this.handleError(error, 'CourseRepository.getTopRated')
    }
  }

  /**
   * Obtiene cursos más populares (por cantidad de inscritos)
   */
  async getMostPopular(limit = 10) {
    try {
      const courses = await this.client.course.findMany({
        where: { isPublished: true },
        include: {
          instructor: { include: { user: true } },
          category: true,
          image: true,
          _count: { select: { enrollments: true, reviews: true } }
        }
      })

      return courses.sort((a, b) => b._count.enrollments - a._count.enrollments).slice(0, limit)
    } catch (error) {
      this.handleError(error, 'CourseRepository.getMostPopular')
    }
  }

  /**
   * Obtiene módulos de un curso
   */
  async getModules(courseId: string) {
    try {
      return await this.client.module.findMany({
        where: { courseId },
        include: {
          lessons: {
            include: {
              contents: { include: { file: true } },
              attachments: { include: { file: true } },
              quiz: true,
              assignments: true,
              _count: { select: { contents: true } }
            },
            orderBy: { position: 'asc' }
          }
        },
        orderBy: { position: 'asc' }
      })
    } catch (error) {
      this.handleError(error, 'CourseRepository.getModules')
    }
  }

  /**
   * Obtiene una lección específica
   */
  async getLesson(lessonId: string) {
    try {
      return await this.client.lesson.findUnique({
        where: { id: lessonId },
        include: {
          module: { include: { course: true } },
          contents: { include: { file: true } },
          attachments: { include: { file: true } },
          quiz: {
            include: {
              questions: {
                include: { options: true, file: true }
              }
            }
          },
          assignments: { include: { submissions: true } },
          userProgress: true
        }
      })
    } catch (error) {
      this.handleError(error, 'CourseRepository.getLesson')
    }
  }

  /**
   * Obtiene reseñas de un curso
   */
  async getReviews(courseId: string) {
    try {
      return await this.client.review.findMany({
        where: { courseId },
        include: {
          user: { include: { profile: true } }
        },
        orderBy: { createdAt: 'desc' }
      })
    } catch (error) {
      this.handleError(error, 'CourseRepository.getReviews')
    }
  }

  /**
   * Obtiene cursos relacionados por categoría
   */
  async getRelated(courseId: string, limit = 6) {
    try {
      const course = await this.client.course.findUnique({
        where: { id: courseId },
        select: { categoryId: true }
      })

      if (!course?.categoryId) {
        return []
      }

      return await this.client.course.findMany({
        where: {
          categoryId: course.categoryId,
          id: { not: courseId },
          isPublished: true
        },
        include: {
          instructor: { include: { user: true } },
          category: true,
          image: true,
          _count: { select: { enrollments: true, reviews: true } }
        },
        take: limit
      })
    } catch (error) {
      this.handleError(error, 'CourseRepository.getRelated')
    }
  }

  /**
   * Obtiene las rutas de aprendizaje que contienen un curso
   */
  async getLearningPaths(courseId: string) {
    try {
      return await this.client.learningPath.findMany({
        where: {
          courses: {
            some: { courseId }
          }
        },
        include: {
          image: true,
          courses: {
            include: { course: true },
            orderBy: { position: 'asc' }
          }
        }
      })
    } catch (error) {
      this.handleError(error, 'CourseRepository.getLearningPaths')
    }
  }

  /**
   * Crea un nuevo curso
   */
  async create(data: any) {
    try {
      return await this.client.course.create({
        data,
        include: {
          instructor: { include: { user: true } },
          category: true
        }
      })
    } catch (error) {
      this.handleError(error, 'CourseRepository.create')
    }
  }

  /**
   * Actualiza un curso
   */
  async update(courseId: string, data: any) {
    try {
      return await this.client.course.update({
        where: { id: courseId },
        data,
        include: {
          instructor: { include: { user: true } },
          category: true,
          image: true
        }
      })
    } catch (error) {
      this.handleError(error, 'CourseRepository.update')
    }
  }

  /**
   * Publica un curso
   */
  async publish(courseId: string) {
    try {
      return await this.client.course.update({
        where: { id: courseId },
        data: {
          isPublished: true,
          publishedAt: new Date()
        }
      })
    } catch (error) {
      this.handleError(error, 'CourseRepository.publish')
    }
  }

  /**
   * Despublica un curso
   */
  async unpublish(courseId: string) {
    try {
      return await this.client.course.update({
        where: { id: courseId },
        data: { isPublished: false }
      })
    } catch (error) {
      this.handleError(error, 'CourseRepository.unpublish')
    }
  }

  /**
   * Elimina un curso
   */
  async delete(courseId: string) {
    try {
      return await this.client.course.delete({
        where: { id: courseId }
      })
    } catch (error) {
      this.handleError(error, 'CourseRepository.delete')
    }
  }

  /**
   * Obtiene los cursos de un instructor
   */
  async getInstructorCourses(instructorUserId: string) {
    try {
      return await this.client.course.findMany({
        where: { instructorId: instructorUserId },
        include: {
          instructor: { include: { user: true } },
          category: true,
          image: true,
          _count: { select: { enrollments: true, reviews: true, modules: true } }
        },
        orderBy: { createdAt: 'desc' }
      })
    } catch (error) {
      this.handleError(error, 'CourseRepository.getInstructorCourses')
      return []
    }
  }
}

export const courseRepository = new CourseRepository()
