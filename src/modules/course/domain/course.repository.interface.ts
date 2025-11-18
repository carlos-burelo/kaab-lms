/**
 * Course Repository Interface (Port)
 * Defines the contract for course persistence
 */

import { Repository } from '@/core/shared/repository.interface';
import { Result } from '@/core/shared/result';
import { Course } from './course.entity';

export interface CourseFilters {
  instructorId?: string;
  categoryId?: string;
  level?: string;
  isPublished?: boolean;
  isFeatured?: boolean;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}

export interface CourseListOptions {
  filters?: CourseFilters;
  page?: number;
  limit?: number;
  orderBy?: {
    field: 'createdAt' | 'updatedAt' | 'rating' | 'title' | 'price';
    direction: 'asc' | 'desc';
  };
}

export interface CourseListResult {
  courses: Course[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ICourseRepository extends Repository<Course> {
  /**
   * Find course by slug
   */
  findBySlug(slug: string): Promise<Result<Course | null>>;

  /**
   * Find courses with filters and pagination
   */
  findMany(
    options?: CourseListOptions
  ): Promise<Result<CourseListResult>>;

  /**
   * Find courses by instructor
   */
  findByInstructor(
    instructorId: string,
    options?: CourseListOptions
  ): Promise<Result<CourseListResult>>;

  /**
   * Find featured courses
   */
  findFeatured(limit?: number): Promise<Result<Course[]>>;

  /**
   * Find published courses
   */
  findPublished(
    options?: CourseListOptions
  ): Promise<Result<CourseListResult>>;

  /**
   * Check if slug exists
   */
  slugExists(slug: string): Promise<Result<boolean>>;

  /**
   * Count courses by instructor
   */
  countByInstructor(instructorId: string): Promise<Result<number>>;

  /**
   * Get course statistics
   */
  getStatistics(courseId: string): Promise<
    Result<{
      enrollmentCount: number;
      completionRate: number;
      averageProgress: number;
      reviewCount: number;
      averageRating: number;
    }>
  >;
}
