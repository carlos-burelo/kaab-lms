/**
 * Course Mapper
 * Maps between domain entity and persistence model
 */

import type { Mapper } from '@/core/shared/mapper.interface';
import { Course, type CourseLevel } from '../domain/course.entity';
import { CourseTitle, CoursePrice, CourseSlug } from '../domain/value-objects';
import type { Course as PrismaCourse } from '@prisma/client';

export class CourseMapper
  implements Mapper<Course, PrismaCourse, CourseDTO>
{
  toDomain(raw: PrismaCourse): Course {
    const titleResult = CourseTitle.create(raw.title);
    const slugResult = CourseSlug.create(raw.slug);

    if (titleResult.isFailure || slugResult.isFailure) {
      throw new Error('Invalid course data from database');
    }

    let price: CoursePrice | undefined;
    if (raw.price) {
      const priceResult = CoursePrice.create(
        Number(raw.price),
        'MXN'
      );
      if (priceResult.isSuccess) {
        price = priceResult.value;
      }
    }

    let discountPrice: CoursePrice | undefined;
    if (raw.discountPrice) {
      const discountPriceResult = CoursePrice.create(
        Number(raw.discountPrice),
        'MXN'
      );
      if (discountPriceResult.isSuccess) {
        discountPrice = discountPriceResult.value;
      }
    }

    const courseResult = Course.create(
      {
        id: raw.id,
        instructorId: raw.instructorId,
        title: titleResult.value,
        slug: slugResult.value,
        description: raw.description || undefined,
        imageId: raw.imageId || undefined,
        price,
        discountPrice,
        level: raw.level as CourseLevel | undefined,
        durationMinutes: raw.durationMinutes || undefined,
        requirements: (raw.requirements as string[]) || undefined,
        objectives: (raw.objectives as string[]) || undefined,
        categoryId: raw.categoryId || undefined,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      }
    );

    if (courseResult.isFailure) {
      throw new Error('Failed to create course domain entity');
    }

    const course = courseResult.value;

    // Restore published state
    if (raw.isPublished) {
      course._props.isPublished = true;
      course._props.publishedAt = raw.publishedAt || undefined;
    }

    // Restore featured state
    if (raw.isFeatured) {
      course._props.isFeatured = true;
    }

    // Restore rating
    course._props.rating = raw.rating;
    course._props.totalReviews = raw.totalReviews;

    return course;
  }

  toPersistence(entity: Course): PrismaCourse {
    return {
      id: entity.id,
      slug: entity.slug.value,
      instructorId: entity.instructorId,
      title: entity.title.value,
      description: entity.description || null,
      imageId: entity.imageId || null,
      price: entity.price ? entity.price.amount : null,
      discountPrice: entity.discountPrice
        ? entity.discountPrice.amount
        : null,
      rating: entity.rating,
      totalReviews: entity.totalReviews,
      level: entity.level || null,
      durationMinutes: entity.durationMinutes || null,
      requirements: entity.requirements || null,
      objectives: entity.objectives || null,
      isPublished: entity.isPublished,
      isFeatured: entity.isFeatured,
      publishedAt: entity.publishedAt || null,
      categoryId: entity.categoryId || null,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    } as PrismaCourse;
  }

  toDTO(entity: Course): CourseDTO {
    return {
      id: entity.id,
      slug: entity.slug.value,
      instructorId: entity.instructorId,
      title: entity.title.value,
      description: entity.description,
      imageId: entity.imageId,
      price: entity.price
        ? {
            amount: entity.price.amount,
            currency: entity.price.currency,
            formatted: entity.price.format(),
          }
        : null,
      discountPrice: entity.discountPrice
        ? {
            amount: entity.discountPrice.amount,
            currency: entity.discountPrice.currency,
            formatted: entity.discountPrice.format(),
          }
        : null,
      rating: entity.rating,
      totalReviews: entity.totalReviews,
      level: entity.level,
      durationMinutes: entity.durationMinutes,
      requirements: entity.requirements,
      objectives: entity.objectives,
      isPublished: entity.isPublished,
      isFeatured: entity.isFeatured,
      publishedAt: entity.publishedAt,
      categoryId: entity.categoryId,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}

/**
 * Course DTO
 */
export interface CourseDTO {
  id: string;
  slug: string;
  instructorId: string;
  title: string;
  description?: string;
  imageId?: string;
  price: {
    amount: number;
    currency: string;
    formatted: string;
  } | null;
  discountPrice: {
    amount: number;
    currency: string;
    formatted: string;
  } | null;
  rating: number;
  totalReviews: number;
  level?: CourseLevel;
  durationMinutes?: number;
  requirements?: string[];
  objectives?: string[];
  isPublished: boolean;
  isFeatured: boolean;
  publishedAt?: Date;
  categoryId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const courseMapper = new CourseMapper();
