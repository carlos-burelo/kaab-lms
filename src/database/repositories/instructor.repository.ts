/**
 * Instructor Repository
 * Centraliza todas las consultas específicas para instructores
 */
import { BaseRepository } from './base.repository'

export class InstructorRepository extends BaseRepository {
  /**
   * Obtiene todos los cursos creados por el instructor
   */
  async getMyCourses(instructorId: string) {
    try {
      return await this.client.course.findMany({
        where: { instructorId },
        include: {
          category: true,
          image: true,
          tags: true,
          modules: {
            include: {
              lessons: true
            }
          },
          enrollments: true,
          purchases: true,
          reviews: true,
          _count: {
            select: {
              enrollments: true,
              reviews: true,
              modules: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    } catch (error) {
      this.handleError(error, 'InstructorRepository.getMyCourses')
    }
  }

  /**
   * Obtiene un curso específico con toda la información
   */
  async getCourseDetail(courseId: string, _instructorId: string) {
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
                  contents: {
                    include: { file: true }
                  },
                  attachments: {
                    include: { file: true }
                  },
                  quiz: {
                    include: {
                      questions: {
                        include: {
                          options: true,
                          file: true
                        }
                      }
                    }
                  },
                  assignments: {
                    include: {
                      submissions: true
                    }
                  }
                }
              }
            },
            orderBy: { position: 'asc' }
          },
          enrollments: {
            include: { user: { include: { profile: true } } }
          },
          reviews: {
            include: { user: { include: { profile: true } } },
            orderBy: { createdAt: 'desc' }
          }
        }
      })
    } catch (error) {
      this.handleError(error, 'InstructorRepository.getCourseDetail')
    }
  }

  /**
   * Obtiene todos los estudiantes inscritos en los cursos del instructor
   */
  async getMyStudents(instructorId: string) {
    try {
      return await this.client.user.findMany({
        where: {
          enrollments: {
            some: {
              course: { instructorId }
            }
          }
        },
        include: {
          profile: true,
          enrollments: {
            where: {
              course: { instructorId }
            },
            include: { course: true }
          },
          gamification: true
        },
        orderBy: { createdAt: 'desc' }
      })
    } catch (error) {
      this.handleError(error, 'InstructorRepository.getMyStudents')
    }
  }

  /**
   * Obtiene el progreso de todos los estudiantes en un curso
   */
  async getCourseStudentsProgress(courseId: string) {
    try {
      const enrollments = await this.client.enrollment.findMany({
        where: { courseId },
        include: {
          user: {
            include: {
              profile: true,
              lessonProgress: {
                where: {
                  lesson: {
                    module: { courseId }
                  }
                }
              }
            }
          }
        }
      })

      return enrollments
    } catch (error) {
      this.handleError(error, 'InstructorRepository.getCourseStudentsProgress')
    }
  }

  /**
   * Obtiene las tareas pendientes de calificación
   */
  async getPendingSubmissions(instructorId: string) {
    try {
      return await this.client.assignmentSubmission.findMany({
        where: {
          assignment: {
            lesson: {
              module: {
                course: { instructorId }
              }
            }
          },
          status: { in: ['SUBMITTED', 'IN_REVIEW'] }
        },
        include: {
          user: { include: { profile: true } },
          assignment: {
            include: {
              lesson: {
                include: {
                  module: {
                    include: { course: true }
                  }
                }
              }
            }
          },
          file: true
        },
        orderBy: { submittedAt: 'desc' }
      })
    } catch (error) {
      this.handleError(error, 'InstructorRepository.getPendingSubmissions')
    }
  }

  /**
   * Obtiene plantillas de certificados del instructor
   */
  async getCertificateTemplates() {
    try {
      return await this.client.certificateTemplate.findMany({
        include: {
          file: true,
          thumbnail: true,
          _count: { select: { certificates: true } }
        },
        orderBy: { createdAt: 'desc' }
      })
    } catch (error) {
      this.handleError(error, 'InstructorRepository.getCertificateTemplates')
    }
  }

  /**
   * Obtiene certificados emitidos en un curso específico
   */
  async getIssuedCertificates(courseId: string) {
    try {
      return await this.client.certificate.findMany({
        where: { courseId },
        include: {
          user: { include: { profile: true } },
          course: true,
          template: true,
          file: true
        },
        orderBy: { issuedAt: 'desc' }
      })
    } catch (error) {
      this.handleError(error, 'InstructorRepository.getIssuedCertificates')
    }
  }

  /**
   * Obtiene reseñas de los cursos del instructor
   */
  async getReviews(instructorId: string) {
    try {
      return await this.client.review.findMany({
        where: {
          course: { instructorId }
        },
        include: {
          user: { include: { profile: true } },
          course: true
        },
        orderBy: { createdAt: 'desc' }
      })
    } catch (error) {
      this.handleError(error, 'InstructorRepository.getReviews')
    }
  }

  /**
   * Obtiene el perfil del instructor
   */
  async getProfile(instructorId: string) {
    try {
      return await this.client.instructorProfile.findUnique({
        where: { userId: instructorId },
        include: { user: true }
      })
    } catch (error) {
      this.handleError(error, 'InstructorRepository.getProfile')
    }
  }

  /**
   * Obtiene estadísticas del instructor
   */
  async getStatistics(instructorId: string) {
    try {
      const courses = await this.client.course.findMany({
        where: { instructorId }
      })

      const totalStudents = await this.client.user.count({
        where: {
          enrollments: {
            some: {
              course: { instructorId }
            }
          }
        }
      })

      const totalReviews = await this.client.review.count({
        where: {
          course: { instructorId }
        }
      })

      const avgRating = await this.client.review.aggregate({
        where: { course: { instructorId } },
        _avg: { rating: true }
      })

      return {
        totalCourses: courses.length,
        totalStudents,
        totalReviews,
        averageRating: avgRating._avg.rating ?? 0,
        publishedCourses: courses.filter((c) => c.isPublished).length
      }
    } catch (error) {
      this.handleError(error, 'InstructorRepository.getStatistics')
    }
  }

  /**
   * Obtiene hilos de discusión en los cursos del instructor
   */
  async getDiscussionThreads(instructorId: string) {
    try {
      return await this.client.discussionThread.findMany({
        where: {
          course: { instructorId }
        },
        include: {
          user: { include: { profile: true } },
          course: true,
          _count: { select: { posts: true } }
        },
        orderBy: { createdAt: 'desc' }
      })
    } catch (error) {
      this.handleError(error, 'InstructorRepository.getDiscussionThreads')
    }
  }

  /**
   * Obtiene anuncios de los cursos del instructor
   */
  async getAnnouncements(instructorId: string) {
    try {
      return await this.client.announcement.findMany({
        where: {
          targetCourse: { instructorId }
        },
        include: {
          image: true,
          targetCourse: true
        },
        orderBy: { createdAt: 'desc' }
      })
    } catch (error) {
      this.handleError(error, 'InstructorRepository.getAnnouncements')
    }
  }

  /**
   * Obtiene las tareas personales del instructor (usuário autenticado)
   * Requiere que el userId sea pasado desde el contexto de sesión
   */
  async getPersonalTasks(userId: string) {
    try {
      return await this.client.personalTask.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      })
    } catch (error) {
      this.handleError(error, 'InstructorRepository.getPersonalTasks')
      return []
    }
  }

  /**
   * Obtiene todas las rutas de aprendizaje del instructor
   */
  async getLearningPaths(instructorId: string) {
    try {
      return await this.client.learningPath.findMany({
        where: { instructorId },
        include: {
          image: true,
          nodes: {
            select: { id: true }
          },
          edges: {
            select: { id: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    } catch (error) {
      this.handleError(error, 'InstructorRepository.getLearningPaths')
      return []
    }
  }

  /**
   * Obtiene los detalles completos de una ruta de aprendizaje (solo si es propietario)
   */
  async getLearningPathDetail(learningPathId: string, _instructorId: string) {
    try {
      return await this.client.learningPath.findUnique({
        where: { id: learningPathId },
        include: {
          instructor: {
            select: { userId: true }
          },
          nodes: true,
          edges: true
        }
      })
    } catch (error) {
      this.handleError(error, 'InstructorRepository.getLearningPathDetail')
      return null
    }
  }

  /**
   * Crea una nueva ruta de aprendizaje
   */
  async createLearningPath(data: {
    title: string
    slug: string
    description: string
    level: string
    estimatedDurationDays?: number
    instructorId: string
  }) {
    try {
      // Check if slug already exists
      const existing = await this.client.learningPath.findUnique({
        where: { slug: data.slug }
      })

      if (existing) {
        return {
          success: false,
          error: 'Este slug ya existe',
          id: null
        }
      }

      const learningPath = await this.client.learningPath.create({
        data: {
          title: data.title,
          slug: data.slug,
          description: data.description,
          level: data.level as any,
          estimatedDurationDays: data.estimatedDurationDays,
          instructorId: data.instructorId
        }
      })

      return {
        success: true,
        id: learningPath.id,
        error: null
      }
    } catch (error) {
      this.handleError(error, 'InstructorRepository.createLearningPath')
      return {
        success: false,
        error: 'Error al crear la ruta',
        id: null
      }
    }
  }

  /**
   * Guarda el diseño de una ruta de aprendizaje (nodos y edges)
   */
  async saveLearningPathDesign(learningPathId: string, nodes: any[], edges: any[], userEmail: string) {
    try {
      // Verify user owns the learning path
      const user = await this.client.user.findUnique({
        where: { email: userEmail },
        select: { id: true }
      })

      const learningPath = await this.client.learningPath.findUnique({
        where: { id: learningPathId },
        select: { id: true, instructorId: true }
      })

      if (!learningPath || learningPath.instructorId !== user?.id) {
        throw new Error('No autorizado')
      }

      // Delete existing nodes and edges
      await this.client.learningPathEdge.deleteMany({
        where: { learningPathId }
      })

      await this.client.learningPathNode.deleteMany({
        where: { learningPathId }
      })

      // Create new nodes
      for (const node of nodes) {
        await this.client.learningPathNode.create({
          data: {
            id: node.id,
            learningPathId,
            nodeType: node.type,
            title: node.title,
            description: node.description,
            position: node.position,
            data: node.data,
            isOptional: node.isOptional
          }
        })
      }

      // Create new edges
      for (const edge of edges) {
        await this.client.learningPathEdge.create({
          data: {
            id: edge.id,
            learningPathId,
            sourceNodeId: edge.source,
            targetNodeId: edge.target,
            label: edge.label,
            condition: edge.condition
          }
        })
      }

      return { success: true }
    } catch (error) {
      this.handleError(error, 'InstructorRepository.saveLearningPathDesign')
      throw error
    }
  }

  /**
   * Elimina una ruta de aprendizaje
   */
  async deleteLearningPath(learningPathId: string, userEmail: string) {
    try {
      // Verify user owns the learning path
      const user = await this.client.user.findUnique({
        where: { email: userEmail },
        select: { id: true }
      })

      const learningPath = await this.client.learningPath.findUnique({
        where: { id: learningPathId },
        select: { id: true, instructorId: true }
      })

      if (!learningPath || learningPath.instructorId !== user?.id) {
        throw new Error('No autorizado')
      }

      await this.client.learningPath.delete({
        where: { id: learningPathId }
      })

      return { success: true }
    } catch (error) {
      this.handleError(error, 'InstructorRepository.deleteLearningPath')
      throw error
    }
  }

  /**
   * Crea una nueva asignación en una lección
   */
  async createAssignment(data: {
    lessonId: string
    title: string
    description: string | null
    instructions: string | null
    dueDate: Date
    maxScore: number
    allowLateSubmission: boolean
    latePenaltyPercent: number | null
  }) {
    try {
      return await this.client.assignment.create({
        data: {
          lessonId: data.lessonId,
          title: data.title,
          description: data.description,
          instructions: data.instructions,
          dueDate: data.dueDate,
          maxScore: data.maxScore,
          allowLateSubmission: data.allowLateSubmission,
          latePenaltyPercent: data.latePenaltyPercent
        }
      })
    } catch (error) {
      this.handleError(error, 'InstructorRepository.createAssignment')
    }
  }

  /**
   * Actualiza una asignación
   */
  async updateAssignment(
    assignmentId: string,
    data: {
      title: string
      description: string | null
      instructions: string | null
      dueDate: Date
      maxScore: number
      allowLateSubmission: boolean
      latePenaltyPercent: number | null
    }
  ) {
    try {
      return await this.client.assignment.update({
        where: { id: assignmentId },
        data: {
          title: data.title,
          description: data.description,
          instructions: data.instructions,
          dueDate: data.dueDate,
          maxScore: data.maxScore,
          allowLateSubmission: data.allowLateSubmission,
          latePenaltyPercent: data.latePenaltyPercent
        }
      })
    } catch (error) {
      this.handleError(error, 'InstructorRepository.updateAssignment')
    }
  }

  /**
   * Obtiene una asignación por ID
   */
  async getAssignmentById(assignmentId: string) {
    try {
      return await this.client.assignment.findUnique({
        where: { id: assignmentId },
        include: {
          lesson: {
            include: {
              module: true
            }
          },
          submissions: {
            include: {
              user: {
                include: {
                  profile: true
                }
              },
              files: true
            }
          }
        }
      })
    } catch (error) {
      this.handleError(error, 'InstructorRepository.getAssignmentById')
    }
  }

  /**
   * Elimina una asignación
   */
  async deleteAssignment(assignmentId: string) {
    try {
      return await this.client.assignment.delete({
        where: { id: assignmentId }
      })
    } catch (error) {
      this.handleError(error, 'InstructorRepository.deleteAssignment')
    }
  }

  /**
   * Obtiene todas las entregas de una asignación
   */
  async getAssignmentSubmissions(assignmentId: string) {
    try {
      return await this.client.assignmentSubmission.findMany({
        where: { assignmentId },
        include: {
          user: {
            include: {
              profile: true
            }
          },
          files: true,
          assignment: true
        },
        orderBy: { submittedAt: 'desc' }
      })
    } catch (error) {
      this.handleError(error, 'InstructorRepository.getAssignmentSubmissions')
    }
  }

  /**
   * Califica una entrega de asignación
   */
  async gradeAssignmentSubmission(
    submissionId: string,
    data: {
      score: number
      feedback: string | null
      status: 'GRADED' | 'NEEDS_REVISION'
    }
  ) {
    try {
      return await this.client.assignmentSubmission.update({
        where: { id: submissionId },
        data: {
          score: data.score,
          feedback: data.feedback,
          status: data.status,
          gradedAt: new Date()
        },
        include: {
          user: {
            include: {
              profile: true
            }
          }
        }
      })
    } catch (error) {
      this.handleError(error, 'InstructorRepository.gradeAssignmentSubmission')
    }
  }

  /**
   * Obtiene un curso por ID (usado para verificación de propiedad)
   */
  async getCourseById(courseId: string) {
    try {
      return await this.client.course.findUnique({
        where: { id: courseId },
        select: {
          id: true,
          instructorId: true,
          title: true
        }
      })
    } catch (error) {
      this.handleError(error, 'InstructorRepository.getCourseById')
    }
  }
}

export const instructorRepository = new InstructorRepository()
