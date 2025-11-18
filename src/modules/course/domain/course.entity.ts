/**
 * Course Aggregate Root
 */

import { AggregateRoot, EntityProps } from '@/core/shared/aggregate-root';
import { Result } from '@/core/shared/result';
import { BusinessRuleError, ValidationError } from '@/core/shared/errors';
import { CourseTitle, CoursePrice, CourseSlug } from './value-objects';
import {
  CourseCreatedEvent,
  CoursePublishedEvent,
} from './events';

export enum CourseLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
  EXPERT = 'EXPERT',
}

export interface CourseProps extends EntityProps {
  instructorId: string;
  title: CourseTitle;
  slug: CourseSlug;
  description?: string;
  imageId?: string;
  price?: CoursePrice;
  discountPrice?: CoursePrice;
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
}

export class Course extends AggregateRoot<CourseProps> {
  get instructorId(): string {
    return this._props.instructorId;
  }

  get title(): CourseTitle {
    return this._props.title;
  }

  get slug(): CourseSlug {
    return this._props.slug;
  }

  get description(): string | undefined {
    return this._props.description;
  }

  get imageId(): string | undefined {
    return this._props.imageId;
  }

  get price(): CoursePrice | undefined {
    return this._props.price;
  }

  get discountPrice(): CoursePrice | undefined {
    return this._props.discountPrice;
  }

  get rating(): number {
    return this._props.rating;
  }

  get totalReviews(): number {
    return this._props.totalReviews;
  }

  get level(): CourseLevel | undefined {
    return this._props.level;
  }

  get durationMinutes(): number | undefined {
    return this._props.durationMinutes;
  }

  get requirements(): string[] | undefined {
    return this._props.requirements;
  }

  get objectives(): string[] | undefined {
    return this._props.objectives;
  }

  get isPublished(): boolean {
    return this._props.isPublished;
  }

  get isFeatured(): boolean {
    return this._props.isFeatured;
  }

  get publishedAt(): Date | undefined {
    return this._props.publishedAt;
  }

  get categoryId(): string | undefined {
    return this._props.categoryId;
  }

  private constructor(props: CourseProps, id?: string) {
    super(props, id);
  }

  /**
   * Create a new course
   */
  static create(
    props: Omit<
      CourseProps,
      | 'id'
      | 'rating'
      | 'totalReviews'
      | 'isPublished'
      | 'isFeatured'
      | 'createdAt'
      | 'updatedAt'
    >
  ): Result<Course, ValidationError> {
    const course = new Course(
      {
        ...props,
        rating: 0,
        totalReviews: 0,
        isPublished: false,
        isFeatured: false,
      },
      props.id
    );

    // Emit domain event
    course.addDomainEvent(
      new CourseCreatedEvent({
        courseId: course.id,
        instructorId: course.instructorId,
        title: course.title.value,
        slug: course.slug.value,
      })
    );

    return Result.ok(course);
  }

  /**
   * Update course title
   */
  updateTitle(newTitle: CourseTitle): Result<void, ValidationError> {
    if (this._props.title.equals(newTitle)) {
      return Result.ok(undefined);
    }

    this._props.title = newTitle;
    this.touch();

    return Result.ok(undefined);
  }

  /**
   * Update course description
   */
  updateDescription(description: string): Result<void, ValidationError> {
    if (description.length > 5000) {
      return Result.fail(
        new ValidationError(
          'Description must not exceed 5000 characters',
          'description'
        )
      );
    }

    this._props.description = description;
    this.touch();

    return Result.ok(undefined);
  }

  /**
   * Update course price
   */
  updatePrice(price: CoursePrice): Result<void, ValidationError> {
    this._props.price = price;
    this.touch();

    return Result.ok(undefined);
  }

  /**
   * Apply discount
   */
  applyDiscount(
    discountPrice: CoursePrice
  ): Result<void, BusinessRuleError> {
    if (!this._props.price) {
      return Result.fail(
        new BusinessRuleError('Cannot apply discount to free course')
      );
    }

    if (discountPrice.amount >= this._props.price.amount) {
      return Result.fail(
        new BusinessRuleError(
          'Discount price must be lower than regular price'
        )
      );
    }

    this._props.discountPrice = discountPrice;
    this.touch();

    return Result.ok(undefined);
  }

  /**
   * Remove discount
   */
  removeDiscount(): void {
    this._props.discountPrice = undefined;
    this.touch();
  }

  /**
   * Update course image
   */
  updateImage(imageId: string): void {
    this._props.imageId = imageId;
    this.touch();
  }

  /**
   * Update course level
   */
  updateLevel(level: CourseLevel): void {
    this._props.level = level;
    this.touch();
  }

  /**
   * Update course category
   */
  updateCategory(categoryId: string): void {
    this._props.categoryId = categoryId;
    this.touch();
  }

  /**
   * Set course requirements
   */
  setRequirements(requirements: string[]): void {
    this._props.requirements = requirements;
    this.touch();
  }

  /**
   * Set course objectives
   */
  setObjectives(objectives: string[]): void {
    this._props.objectives = objectives;
    this.touch();
  }

  /**
   * Set course duration
   */
  setDuration(durationMinutes: number): Result<void, ValidationError> {
    if (durationMinutes < 0) {
      return Result.fail(
        new ValidationError('Duration cannot be negative', 'durationMinutes')
      );
    }

    this._props.durationMinutes = durationMinutes;
    this.touch();

    return Result.ok(undefined);
  }

  /**
   * Publish course
   */
  publish(): Result<void, BusinessRuleError> {
    if (this._props.isPublished) {
      return Result.fail(
        new BusinessRuleError('Course is already published')
      );
    }

    // Business rules for publishing
    if (!this._props.description) {
      return Result.fail(
        new BusinessRuleError('Course must have a description to be published')
      );
    }

    if (!this._props.imageId) {
      return Result.fail(
        new BusinessRuleError('Course must have an image to be published')
      );
    }

    this._props.isPublished = true;
    this._props.publishedAt = new Date();
    this.touch();

    // Emit domain event
    this.addDomainEvent(
      new CoursePublishedEvent({
        courseId: this.id,
        instructorId: this.instructorId,
        title: this.title.value,
        publishedAt: this._props.publishedAt,
      })
    );

    return Result.ok(undefined);
  }

  /**
   * Unpublish course
   */
  unpublish(): Result<void, BusinessRuleError> {
    if (!this._props.isPublished) {
      return Result.fail(
        new BusinessRuleError('Course is not published')
      );
    }

    this._props.isPublished = false;
    this.touch();

    return Result.ok(undefined);
  }

  /**
   * Mark as featured
   */
  markAsFeatured(): void {
    this._props.isFeatured = true;
    this.touch();
  }

  /**
   * Unmark as featured
   */
  unmarkAsFeatured(): void {
    this._props.isFeatured = false;
    this.touch();
  }

  /**
   * Update rating
   */
  updateRating(newRating: number, reviewCount: number): void {
    this._props.rating = newRating;
    this._props.totalReviews = reviewCount;
    this.touch();
  }

  /**
   * Check if user can edit
   */
  canBeEditedBy(userId: string): boolean {
    return this._props.instructorId === userId;
  }

  toObject(): CourseProps & {
    id: string;
    createdAt: Date;
    updatedAt: Date;
  } {
    return {
      id: this.id,
      instructorId: this.instructorId,
      title: this.title,
      slug: this.slug,
      description: this.description,
      imageId: this.imageId,
      price: this.price,
      discountPrice: this.discountPrice,
      rating: this.rating,
      totalReviews: this.totalReviews,
      level: this.level,
      durationMinutes: this.durationMinutes,
      requirements: this.requirements,
      objectives: this.objectives,
      isPublished: this.isPublished,
      isFeatured: this.isFeatured,
      publishedAt: this.publishedAt,
      categoryId: this.categoryId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  clone(): Course {
    return new Course({ ...this._props }, this._id);
  }
}
