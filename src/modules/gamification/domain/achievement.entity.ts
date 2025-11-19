/**
 * Achievement Aggregate Root
 */

import { AggregateRoot, type EntityProps } from '@/core/shared/aggregate-root';
import { Result } from '@/core/shared/result';
import { ValidationError, BusinessRuleError } from '@/core/shared/errors';
import type { AchievementCategory } from './value-objects';
import { AchievementUnlockedEvent } from './events';

export interface AchievementProps extends EntityProps {
  name: string;
  description: string;
  category: AchievementCategory;
  imageId?: string;
  xpReward: number;
  coinReward: number;
  maxProgress: number;
}

export class Achievement extends AggregateRoot<AchievementProps> {
  get name(): string {
    return this._props.name;
  }

  get description(): string {
    return this._props.description;
  }

  get category(): AchievementCategory {
    return this._props.category;
  }

  get imageId(): string | undefined {
    return this._props.imageId;
  }

  get xpReward(): number {
    return this._props.xpReward;
  }

  get coinReward(): number {
    return this._props.coinReward;
  }

  get maxProgress(): number {
    return this._props.maxProgress;
  }

  private constructor(props: AchievementProps, id?: string) {
    super(props, id);
  }

  /**
   * Create a new achievement
   */
  static create(
    props: Omit<AchievementProps, 'id' | 'createdAt' | 'updatedAt'>
  ): Result<Achievement, ValidationError> {
    // Validations
    if (props.name.trim().length < 3) {
      return Result.fail(
        new ValidationError(
          'Achievement name must be at least 3 characters',
          'name'
        )
      );
    }

    if (props.description.trim().length < 10) {
      return Result.fail(
        new ValidationError(
          'Achievement description must be at least 10 characters',
          'description'
        )
      );
    }

    if (props.xpReward < 0) {
      return Result.fail(
        new ValidationError('XP reward cannot be negative', 'xpReward')
      );
    }

    if (props.coinReward < 0) {
      return Result.fail(
        new ValidationError('Coin reward cannot be negative', 'coinReward')
      );
    }

    if (props.maxProgress < 1) {
      return Result.fail(
        new ValidationError(
          'Max progress must be at least 1',
          'maxProgress'
        )
      );
    }

    const achievement = new Achievement(props, props.id);

    return Result.ok(achievement);
  }

  /**
   * Update achievement name
   */
  updateName(newName: string): Result<void, ValidationError> {
    if (newName.trim().length < 3) {
      return Result.fail(
        new ValidationError(
          'Achievement name must be at least 3 characters',
          'name'
        )
      );
    }

    this._props.name = newName;
    this.touch();

    return Result.ok(undefined);
  }

  /**
   * Update achievement description
   */
  updateDescription(newDescription: string): Result<void, ValidationError> {
    if (newDescription.trim().length < 10) {
      return Result.fail(
        new ValidationError(
          'Achievement description must be at least 10 characters',
          'description'
        )
      );
    }

    this._props.description = newDescription;
    this.touch();

    return Result.ok(undefined);
  }

  /**
   * Update achievement category
   */
  updateCategory(category: AchievementCategory): void {
    this._props.category = category;
    this.touch();
  }

  /**
   * Update achievement image
   */
  updateImage(imageId: string): void {
    this._props.imageId = imageId;
    this.touch();
  }

  /**
   * Update XP reward
   */
  updateXpReward(xpReward: number): Result<void, ValidationError> {
    if (xpReward < 0) {
      return Result.fail(
        new ValidationError('XP reward cannot be negative', 'xpReward')
      );
    }

    this._props.xpReward = xpReward;
    this.touch();

    return Result.ok(undefined);
  }

  /**
   * Update coin reward
   */
  updateCoinReward(coinReward: number): Result<void, ValidationError> {
    if (coinReward < 0) {
      return Result.fail(
        new ValidationError('Coin reward cannot be negative', 'coinReward')
      );
    }

    this._props.coinReward = coinReward;
    this.touch();

    return Result.ok(undefined);
  }

  /**
   * Update max progress
   */
  updateMaxProgress(maxProgress: number): Result<void, ValidationError> {
    if (maxProgress < 1) {
      return Result.fail(
        new ValidationError(
          'Max progress must be at least 1',
          'maxProgress'
        )
      );
    }

    this._props.maxProgress = maxProgress;
    this.touch();

    return Result.ok(undefined);
  }

  /**
   * Unlock achievement for user
   */
  unlock(userId: string): Result<void, BusinessRuleError> {
    if (!userId || userId.trim().length === 0) {
      return Result.fail(new BusinessRuleError('User ID is required'));
    }

    // Emit domain event
    this.addDomainEvent(
      new AchievementUnlockedEvent({
        achievementId: this.id,
        userId,
        achievementName: this.name,
        xpReward: this.xpReward,
        coinReward: this.coinReward,
      })
    );

    return Result.ok(undefined);
  }

  /**
   * Check if achievement is unlocked based on progress
   */
  isUnlocked(currentProgress: number): boolean {
    return currentProgress >= this.maxProgress;
  }

  /**
   * Calculate progress percentage
   */
  calculateProgressPercentage(currentProgress: number): number {
    return Math.min(100, (currentProgress / this.maxProgress) * 100);
  }

  toObject(): AchievementProps & {
    id: string;
    createdAt: Date;
    updatedAt: Date;
  } {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      category: this.category,
      imageId: this.imageId,
      xpReward: this.xpReward,
      coinReward: this.coinReward,
      maxProgress: this.maxProgress,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  clone(): Achievement {
    return new Achievement({ ...this._props }, this._id);
  }
}
