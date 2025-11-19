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
    maxPoints: number
    allowLate: boolean
  }) {
    try {
      return await this.client.assignment.create({
        data: {
          lessonId: data.lessonId,
          title: data.title,
          description: data.description,
          instructions: data.instructions,
          dueDate: data.dueDate,
          maxPoints: data.maxPoints,
          allowLate: data.allowLate
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
      maxPoints: number
      allowLate: boolean
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
          maxPoints: data.maxPoints,
          allowLate: data.allowLate
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
              file: true
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
          file: true,
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
      grade: number
      feedback: string | null
      status: 'GRADED' | 'NEEDS_REVISION'
    }
  ) {
    try {
      return await this.client.assignmentSubmission.update({
        where: { id: submissionId },
        data: {
          grade: data.grade,
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

  // ============================================
  // ANUNCIOS (ANNOUNCEMENTS)
  // ============================================

  /**
   * Crea un nuevo anuncio
   */
  async createAnnouncement(data: {
    title: string
    content: string
    ctaLink?: string | null
    ctaText?: string | null
    imageId?: string | null
    placement: string
    startDate: Date
    endDate: Date
    priority: number
    targetRole?: string | null
    targetCourseId?: string | null
  }) {
    try {
      return await this.client.announcement.create({
        data: {
          title: data.title,
          content: data.content,
          ctaLink: data.ctaLink,
          ctaText: data.ctaText,
          imageId: data.imageId,
          placement: data.placement as any,
          startDate: data.startDate,
          endDate: data.endDate,
          priority: data.priority,
          targetRole: data.targetRole as any,
          targetCourseId: data.targetCourseId
        },
        include: {
          image: true,
          targetCourse: true
        }
      })
    } catch (error) {
      this.handleError(error, 'InstructorRepository.createAnnouncement')
    }
  }

  /**
   * Actualiza un anuncio
   */
  async updateAnnouncement(
    announcementId: string,
    data: {
      title?: string
      content?: string
      ctaLink?: string | null
      ctaText?: string | null
      imageId?: string | null
      placement?: string
      startDate?: Date
      endDate?: Date
      priority?: number
      isActive?: boolean
      targetRole?: string | null
      targetCourseId?: string | null
    }
  ) {
    try {
      return await this.client.announcement.update({
        where: { id: announcementId },
        data: {
          title: data.title,
          content: data.content,
          ctaLink: data.ctaLink,
          ctaText: data.ctaText,
          imageId: data.imageId,
          placement: data.placement as any,
          startDate: data.startDate,
          endDate: data.endDate,
          priority: data.priority,
          isActive: data.isActive,
          targetRole: data.targetRole as any,
          targetCourseId: data.targetCourseId
        },
        include: {
          image: true,
          targetCourse: true
        }
      })
    } catch (error) {
      this.handleError(error, 'InstructorRepository.updateAnnouncement')
    }
  }

  /**
   * Elimina un anuncio
   */
  async deleteAnnouncement(announcementId: string) {
    try {
      return await this.client.announcement.delete({
        where: { id: announcementId }
      })
    } catch (error) {
      this.handleError(error, 'InstructorRepository.deleteAnnouncement')
    }
  }

  /**
   * Obtiene un anuncio específico
   */
  async getAnnouncementById(announcementId: string) {
    try {
      return await this.client.announcement.findUnique({
        where: { id: announcementId },
        include: {
          image: true,
          targetCourse: true,
          _count: {
            select: {
              userViews: true
            }
          }
        }
      })
    } catch (error) {
      this.handleError(error, 'InstructorRepository.getAnnouncementById')
    }
  }

  // ============================================
  // FOROS DE DISCUSIÓN
  // ============================================

  /**
   * Obtiene un thread específico con sus posts
   */
  async getThreadDetail(threadId: string) {
    try {
      return await this.client.discussionThread.findUnique({
        where: { id: threadId },
        include: {
          user: { include: { profile: true } },
          course: true,
          posts: {
            include: {
              user: { include: { profile: true } },
              replies: {
                include: {
                  user: { include: { profile: true } }
                }
              }
            },
            orderBy: { createdAt: 'asc' }
          }
        }
      })
    } catch (error) {
      this.handleError(error, 'InstructorRepository.getThreadDetail')
    }
  }

  /**
   * Crea un post en un thread de discusión
   */
  async createDiscussionPost(data: { threadId: string; userId: string; content: string; parentId?: string | null }) {
    try {
      const post = await this.client.discussionPost.create({
        data: {
          threadId: data.threadId,
          userId: data.userId,
          content: data.content,
          parentId: data.parentId,
          isReply: !!data.parentId
        },
        include: {
          user: { include: { profile: true } }
        }
      })

      // Increment views if it's a new post (not a reply)
      if (!data.parentId) {
        await this.client.discussionThread.update({
          where: { id: data.threadId },
          data: { views: { increment: 1 } }
        })
      }

      return post
    } catch (error) {
      this.handleError(error, 'InstructorRepository.createDiscussionPost')
    }
  }

  /**
   * Actualiza un thread (cerrar, pin, etc.)
   */
  async updateDiscussionThread(
    threadId: string,
    data: {
      isClosed?: boolean
      isPinned?: boolean
    }
  ) {
    try {
      return await this.client.discussionThread.update({
        where: { id: threadId },
        data
      })
    } catch (error) {
      this.handleError(error, 'InstructorRepository.updateDiscussionThread')
    }
  }

  // ============================================
  // MENSAJERÍA
  // ============================================

  /**
   * Obtiene todas las conversaciones del instructor
   */
  async getConversations(userId: string) {
    try {
      return await this.client.conversation.findMany({
        where: {
          OR: [{ initiatorId: userId }, { receiverId: userId }]
        },
        include: {
          initiator: { include: { profile: true } },
          receiver: { include: { profile: true } },
          messages: {
            take: 1,
            orderBy: { createdAt: 'desc' }
          }
        },
        orderBy: { lastMessageAt: 'desc' }
      })
    } catch (error) {
      this.handleError(error, 'InstructorRepository.getConversations')
    }
  }

  /**
   * Obtiene una conversación específica con todos sus mensajes
   */
  async getConversationDetail(conversationId: string, userId: string) {
    try {
      const conversation = await this.client.conversation.findUnique({
        where: { id: conversationId },
        include: {
          initiator: { include: { profile: true } },
          receiver: { include: { profile: true } },
          messages: {
            include: {
              sender: { include: { profile: true } },
              file: true
            },
            orderBy: { createdAt: 'asc' }
          }
        }
      })

      if (conversation) {
        // Mark messages as read
        await this.client.message.updateMany({
          where: {
            conversationId,
            senderId: { not: userId },
            isRead: false
          },
          data: {
            isRead: true,
            readAt: new Date()
          }
        })

        // Update unread count
        if (conversation.initiatorId === userId) {
          await this.client.conversation.update({
            where: { id: conversationId },
            data: { unreadInitiator: 0 }
          })
        } else {
          await this.client.conversation.update({
            where: { id: conversationId },
            data: { unreadReceiver: 0 }
          })
        }
      }

      return conversation
    } catch (error) {
      this.handleError(error, 'InstructorRepository.getConversationDetail')
    }
  }

  /**
   * Envía un mensaje en una conversación
   */
  async sendMessage(data: { conversationId: string; senderId: string; content: string; fileId?: string | null }) {
    try {
      const message = await this.client.message.create({
        data: {
          conversationId: data.conversationId,
          senderId: data.senderId,
          content: data.content,
          fileId: data.fileId
        },
        include: {
          sender: { include: { profile: true } },
          file: true
        }
      })

      // Update conversation
      const conversation = await this.client.conversation.findUnique({
        where: { id: data.conversationId }
      })

      if (conversation) {
        await this.client.conversation.update({
          where: { id: data.conversationId },
          data: {
            lastMessage: data.content,
            lastMessageAt: new Date(),
            unreadInitiator: conversation.initiatorId === data.senderId ? conversation.unreadInitiator : { increment: 1 },
            unreadReceiver: conversation.receiverId === data.senderId ? conversation.unreadReceiver : { increment: 1 }
          }
        })
      }

      return message
    } catch (error) {
      this.handleError(error, 'InstructorRepository.sendMessage')
    }
  }

  /**
   * Crea o obtiene una conversación con un usuario
   */
  async getOrCreateConversation(initiatorId: string, receiverId: string) {
    try {
      // Try to find existing conversation
      let conversation = await this.client.conversation.findFirst({
        where: {
          OR: [
            { initiatorId, receiverId },
            { initiatorId: receiverId, receiverId: initiatorId }
          ]
        },
        include: {
          initiator: { include: { profile: true } },
          receiver: { include: { profile: true } }
        }
      })

      // Create if doesn't exist
      if (!conversation) {
        conversation = await this.client.conversation.create({
          data: {
            initiatorId,
            receiverId
          },
          include: {
            initiator: { include: { profile: true } },
            receiver: { include: { profile: true } }
          }
        })
      }

      return conversation
    } catch (error) {
      this.handleError(error, 'InstructorRepository.getOrCreateConversation')
    }
  }

  // ============================================
  // NOTIFICACIONES
  // ============================================

  /**
   * Obtiene todas las notificaciones del usuario
   */
  async getNotifications(userId: string, limit = 50) {
    try {
      return await this.client.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit
      })
    } catch (error) {
      this.handleError(error, 'InstructorRepository.getNotifications')
    }
  }

  /**
   * Marca notificaciones como leídas
   */
  async markNotificationsAsRead(userId: string, notificationIds?: string[]) {
    try {
      if (notificationIds && notificationIds.length > 0) {
        return await this.client.notification.updateMany({
          where: {
            userId,
            id: { in: notificationIds }
          },
          data: {
            isRead: true,
            readAt: new Date()
          }
        })
      } else {
        return await this.client.notification.updateMany({
          where: { userId },
          data: {
            isRead: true,
            readAt: new Date()
          }
        })
      }
    } catch (error) {
      this.handleError(error, 'InstructorRepository.markNotificationsAsRead')
    }
  }

  /**
   * Cuenta notificaciones no leídas
   */
  async countUnreadNotifications(userId: string) {
    try {
      return await this.client.notification.count({
        where: {
          userId,
          isRead: false
        }
      })
    } catch (error) {
      this.handleError(error, 'InstructorRepository.countUnreadNotifications')
      return 0
    }
  }

  // ============================================
  // PERFIL DEL INSTRUCTOR
  // ============================================

  /**
   * Actualiza el perfil del instructor
   */
  async updateInstructorProfile(
    userId: string,
    data: {
      publicBio?: string | null
      qualifications?: any
      payoutDetails?: any
    }
  ) {
    try {
      return await this.client.instructorProfile.upsert({
        where: { userId },
        create: {
          userId,
          publicBio: data.publicBio,
          qualifications: data.qualifications,
          payoutDetails: data.payoutDetails
        },
        update: {
          publicBio: data.publicBio,
          qualifications: data.qualifications,
          payoutDetails: data.payoutDetails
        },
        include: {
          user: { include: { profile: true } }
        }
      })
    } catch (error) {
      this.handleError(error, 'InstructorRepository.updateInstructorProfile')
    }
  }

  // ============================================
  // INGRESOS Y PAGOS
  // ============================================

  /**
   * Obtiene todas las compras de cursos del instructor
   */
  async getMyPurchases(instructorId: string) {
    try {
      return await this.client.purchase.findMany({
        where: {
          course: { instructorId }
        },
        include: {
          user: { include: { profile: true } },
          course: true,
          payment: true
        },
        orderBy: { createdAt: 'desc' }
      })
    } catch (error) {
      this.handleError(error, 'InstructorRepository.getMyPurchases')
    }
  }

  /**
   * Obtiene estadísticas de ingresos
   */
  async getRevenueStats(instructorId: string) {
    try {
      const purchases = await this.client.purchase.findMany({
        where: {
          course: { instructorId }
        },
        include: {
          payment: true
        }
      })

      const totalRevenue = purchases.reduce((sum, p) => sum + Number(p.price), 0)
      const totalPurchases = purchases.length

      // Revenue by month (last 12 months)
      const revenueByMonth = await this.client.$queryRaw<Array<{ month: string; total: number }>>`
        SELECT
          DATE_FORMAT(p.createdAt, '%Y-%m') as month,
          SUM(p.price) as total
        FROM Purchase p
        INNER JOIN Course c ON p.courseId = c.id
        WHERE c.instructorId = ${instructorId}
          AND p.createdAt >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
        GROUP BY DATE_FORMAT(p.createdAt, '%Y-%m')
        ORDER BY month DESC
      `

      return {
        totalRevenue,
        totalPurchases,
        revenueByMonth
      }
    } catch (error) {
      this.handleError(error, 'InstructorRepository.getRevenueStats')
      return {
        totalRevenue: 0,
        totalPurchases: 0,
        revenueByMonth: []
      }
    }
  }

  // ============================================
  // REVIEWS EXTENDIDO
  // ============================================

  /**
   * Obtiene reviews con filtros y paginación
   */
  async getReviewsFiltered(
    instructorId: string,
    options: {
      courseId?: string
      rating?: number
      page?: number
      limit?: number
    } = {}
  ) {
    try {
      const where: any = {
        course: { instructorId }
      }

      if (options.courseId) {
        where.courseId = options.courseId
      }

      if (options.rating) {
        where.rating = options.rating
      }

      const page = options.page || 1
      const limit = options.limit || 20
      const skip = (page - 1) * limit

      const [reviews, total] = await Promise.all([
        this.client.review.findMany({
          where,
          include: {
            user: { include: { profile: true } },
            course: true
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit
        }),
        this.client.review.count({ where })
      ])

      return {
        reviews,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    } catch (error) {
      this.handleError(error, 'InstructorRepository.getReviewsFiltered')
      return {
        reviews: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0
      }
    }
  }
}

export const instructorRepository = new InstructorRepository()
