import { prisma } from '@/database/client'

interface EnrollmentFilters {
  courseId?: string
  status?: 'all' | 'active' | 'completed' | 'inactive'
  search?: string
  minProgress?: number
  maxProgress?: number
  isCompleted?: boolean
  dateFrom?: Date
  dateTo?: Date
}

interface EnrollmentListOptions {
  filters?: EnrollmentFilters
  limit?: number
  offset?: number
  sortBy?: 'createdAt' | 'progress' | 'lastAccessed' | 'name'
  sortOrder?: 'asc' | 'desc'
}

interface EnrollmentListResult {
  enrollments: any[]
  total: number
  limit: number
  offset: number
}

interface EnrollmentStats {
  totalEnrollments: number
  activeEnrollments: number
  completedEnrollments: number
  averageProgress: number
  totalTimeMinutes: number
  enrollmentsByDate: Record<string, number>
  completionRate: number
}

export class EnrollmentRepository {
  /**
   * Get enrollments for a course with filters
   */
  async getEnrollmentsByCourse(courseId: string, options: EnrollmentListOptions = {}): Promise<EnrollmentListResult> {
    const { filters = {}, limit = 50, offset = 0, sortBy = 'createdAt', sortOrder = 'desc' } = options

    const where: any = {
      courseId
    }

    // Status filter
    if (filters.status && filters.status !== 'all') {
      if (filters.status === 'completed') {
        where.isCompleted = true
      } else if (filters.status === 'active') {
        where.isCompleted = false
        where.lastAccessed = {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        }
      } else if (filters.status === 'inactive') {
        where.isCompleted = false
        where.lastAccessed = {
          lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      }
    }

    // Progress filter
    if (filters.minProgress !== undefined || filters.maxProgress !== undefined) {
      where.progress = {
        ...(filters.minProgress !== undefined && { gte: filters.minProgress }),
        ...(filters.maxProgress !== undefined && { lte: filters.maxProgress })
      }
    }

    // IsCompleted filter
    if (filters.isCompleted !== undefined) {
      where.isCompleted = filters.isCompleted
    }

    // Date range filter
    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {
        ...(filters.dateFrom && { gte: filters.dateFrom }),
        ...(filters.dateTo && { lte: filters.dateTo })
      }
    }

    // Search filter
    if (filters.search) {
      where.user = {
        OR: [
          { profile: { name: { contains: filters.search, mode: 'insensitive' } } },
          { email: { contains: filters.search, mode: 'insensitive' } }
        ]
      }
    }

    const [enrollments, total] = await Promise.all([
      prisma.enrollment.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: {
          [sortBy === 'name' ? 'user' : sortBy]: sortBy === 'name' ? { profile: { name: sortOrder } } : sortOrder
        },
        include: {
          user: {
            include: {
              profile: true
            }
          },
          course: true
        }
      }),
      prisma.enrollment.count({ where })
    ])

    return {
      enrollments,
      total,
      limit,
      offset
    }
  }

  /**
   * Get single enrollment
   */
  async getEnrollmentById(enrollmentId: string) {
    return prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        user: {
          include: {
            profile: true,
            gamification: true
          }
        },
        course: {
          include: {
            modules: {
              include: {
                lessons: {
                  include: {
                    userProgress: {
                      where: {
                        userId: 'placeholder' // Will be filled by caller
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    })
  }

  /**
   * Get enrollment with progress details
   */
  async getEnrollmentWithProgress(enrollmentId: string, userId: string) {
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        user: {
          include: {
            profile: true
          }
        },
        course: {
          include: {
            modules: {
              include: {
                lessons: {
                  include: {
                    userProgress: {
                      where: { userId }
                    },
                    quiz: {
                      include: {
                        attempts: {
                          where: { userId }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    })

    return enrollment
  }

  /**
   * Get course statistics
   */
  async getCourseEnrollmentStats(courseId: string): Promise<EnrollmentStats> {
    const enrollments = await prisma.enrollment.findMany({
      where: { courseId },
      include: {
        user: true
      }
    })

    const totalEnrollments = enrollments.length
    const completedEnrollments = enrollments.filter((e) => e.isCompleted).length
    const activeEnrollments = enrollments.filter((e) => {
      if (!e.lastAccessed) return false
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      return e.lastAccessed > thirtyDaysAgo && !e.isCompleted
    }).length

    const avgProgress = enrollments.length > 0 ? enrollments.reduce((sum, e) => sum + e.progress, 0) / enrollments.length : 0

    const totalTime = enrollments.reduce((sum, e) => sum + e.totalTimeMinutes, 0)

    const completionRate = totalEnrollments > 0 ? (completedEnrollments / totalEnrollments) * 100 : 0

    // Group enrollments by date
    const enrollmentsByDate: Record<string, number> = {}
    enrollments.forEach((e) => {
      const date = new Date(e.createdAt).toISOString().split('T')[0]
      enrollmentsByDate[date] = (enrollmentsByDate[date] || 0) + 1
    })

    return {
      totalEnrollments,
      activeEnrollments,
      completedEnrollments,
      averageProgress: Math.round(avgProgress * 100) / 100,
      totalTimeMinutes: totalTime,
      enrollmentsByDate,
      completionRate: Math.round(completionRate * 100) / 100
    }
  }

  /**
   * Update enrollment progress
   */
  async updateEnrollment(enrollmentId: string, data: any) {
    return prisma.enrollment.update({
      where: { id: enrollmentId },
      data,
      include: {
        user: {
          include: {
            profile: true
          }
        }
      }
    })
  }

  /**
   * Mark enrollment as completed
   */
  async completeEnrollment(enrollmentId: string) {
    return this.updateEnrollment(enrollmentId, {
      isCompleted: true,
      progress: 100,
      completedAt: new Date()
    })
  }

  /**
   * Get student enrollments
   */
  async getStudentEnrollments(userId: string) {
    return prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            instructor: {
              include: {
                user: {
                  include: {
                    profile: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
  }

  /**
   * Bulk update enrollments
   */
  async bulkUpdateEnrollments(enrollmentIds: string[], data: any) {
    return prisma.enrollment.updateMany({
      where: { id: { in: enrollmentIds } },
      data
    })
  }

  /**
   * Get enrollments by status
   */
  async getEnrollmentsByStatus(courseId: string, status: 'completed' | 'active' | 'inactive') {
    const where: any = { courseId }

    if (status === 'completed') {
      where.isCompleted = true
    } else if (status === 'active') {
      where.isCompleted = false
      where.lastAccessed = {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      }
    } else if (status === 'inactive') {
      where.isCompleted = false
      where.lastAccessed = {
        lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      }
    }

    return prisma.enrollment.findMany({
      where,
      include: {
        user: {
          include: {
            profile: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
  }

  /**
   * Search enrollments
   */
  async searchEnrollments(courseId: string, query: string) {
    return prisma.enrollment.findMany({
      where: {
        courseId,
        user: {
          OR: [
            { email: { contains: query, mode: 'insensitive' } },
            { profile: { name: { contains: query, mode: 'insensitive' } } }
          ]
        }
      },
      include: {
        user: {
          include: {
            profile: true
          }
        }
      },
      take: 50
    })
  }

  /**
   * Get top performers
   */
  async getTopPerformers(courseId: string, limit: number = 10) {
    return prisma.enrollment.findMany({
      where: { courseId },
      include: {
        user: {
          include: {
            profile: true
          }
        }
      },
      orderBy: { progress: 'desc' },
      take: limit
    })
  }

  /**
   * Get at-risk students (low progress, no recent access)
   */
  async getAtRiskStudents(courseId: string) {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    return prisma.enrollment.findMany({
      where: {
        courseId,
        isCompleted: false,
        progress: { lt: 50 },
        lastAccessed: { lt: thirtyDaysAgo }
      },
      include: {
        user: {
          include: {
            profile: true
          }
        }
      }
    })
  }

  /**
   * Get recent enrollments
   */
  async getRecentEnrollments(courseId: string, days: number = 7) {
    const dateFrom = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

    return prisma.enrollment.findMany({
      where: {
        courseId,
        createdAt: { gte: dateFrom }
      },
      include: {
        user: {
          include: {
            profile: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
  }

  /**
   * Count enrollments by status
   */
  async countByStatus(courseId: string) {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    const [completed, active, inactive] = await Promise.all([
      prisma.enrollment.count({
        where: {
          courseId,
          isCompleted: true
        }
      }),
      prisma.enrollment.count({
        where: {
          courseId,
          isCompleted: false,
          lastAccessed: { gte: thirtyDaysAgo }
        }
      }),
      prisma.enrollment.count({
        where: {
          courseId,
          isCompleted: false,
          lastAccessed: { lt: thirtyDaysAgo }
        }
      })
    ])

    return { completed, active, inactive }
  }

  /**
   * Get average completion time
   */
  async getAverageCompletionTime(courseId: string) {
    const completedEnrollments = await prisma.enrollment.findMany({
      where: {
        courseId,
        isCompleted: true,
        completedAt: { not: null }
      },
      select: {
        createdAt: true,
        completedAt: true
      }
    })

    if (completedEnrollments.length === 0) return 0

    const totalTime = completedEnrollments.reduce((sum, e) => {
      const diffMs = new Date(e.completedAt!).getTime() - new Date(e.createdAt).getTime()
      return sum + diffMs
    }, 0)

    const averageMs = totalTime / completedEnrollments.length
    return Math.round(averageMs / (1000 * 60 * 60 * 24)) // Return days
  }
}

export const enrollmentRepository = new EnrollmentRepository()
