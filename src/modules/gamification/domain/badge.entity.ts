/**
 * Badge Aggregate Root
 */

import { AggregateRoot, type EntityProps } from '@/core/shared/aggregate-root'
import { BusinessRuleError, ValidationError } from '@/core/shared/errors'
import { Result } from '@/core/shared/result'
import { BadgeAwardedEvent } from './events'
import type { BadgeRarity } from './value-objects'

export interface BadgeProps extends EntityProps {
  name: string
  description: string
  imageId?: string
  rarity: BadgeRarity
  condition: Record<string, any>
}

export class Badge extends AggregateRoot<BadgeProps> {
  get name(): string {
    return this._props.name
  }

  get description(): string {
    return this._props.description
  }

  get imageId(): string | undefined {
    return this._props.imageId
  }

  get rarity(): BadgeRarity {
    return this._props.rarity
  }

  get condition(): Record<string, any> {
    return this._props.condition
  }

  private constructor(props: BadgeProps, id?: string) {
    super(props, id)
  }

  /**
   * Create a new badge
   */
  static create(props: Omit<BadgeProps, 'id' | 'createdAt' | 'updatedAt'>): Result<Badge, ValidationError> {
    // Validations
    if (props.name.trim().length < 3) {
      return Result.fail(new ValidationError('Badge name must be at least 3 characters', 'name'))
    }

    if (props.description.trim().length < 10) {
      return Result.fail(new ValidationError('Badge description must be at least 10 characters', 'description'))
    }

    if (!props.condition || Object.keys(props.condition).length === 0) {
      return Result.fail(new ValidationError('Badge must have at least one condition', 'condition'))
    }

    const badge = new Badge(props, props.id)

    return Result.ok(badge)
  }

  /**
   * Update badge name
   */
  updateName(newName: string): Result<void, ValidationError> {
    if (newName.trim().length < 3) {
      return Result.fail(new ValidationError('Badge name must be at least 3 characters', 'name'))
    }

    this._props.name = newName
    this.touch()

    return Result.ok(undefined)
  }

  /**
   * Update badge description
   */
  updateDescription(newDescription: string): Result<void, ValidationError> {
    if (newDescription.trim().length < 10) {
      return Result.fail(new ValidationError('Badge description must be at least 10 characters', 'description'))
    }

    this._props.description = newDescription
    this.touch()

    return Result.ok(undefined)
  }

  /**
   * Update badge image
   */
  updateImage(imageId: string): void {
    this._props.imageId = imageId
    this.touch()
  }

  /**
   * Update badge rarity
   */
  updateRarity(rarity: BadgeRarity): void {
    this._props.rarity = rarity
    this.touch()
  }

  /**
   * Update badge condition
   */
  updateCondition(condition: Record<string, any>): Result<void, ValidationError> {
    if (!condition || Object.keys(condition).length === 0) {
      return Result.fail(new ValidationError('Badge must have at least one condition', 'condition'))
    }

    this._props.condition = condition
    this.touch()

    return Result.ok(undefined)
  }

  /**
   * Award badge to user
   */
  award(userId: string): Result<void, BusinessRuleError> {
    if (!userId || userId.trim().length === 0) {
      return Result.fail(new BusinessRuleError('User ID is required'))
    }

    // Emit domain event
    this.addDomainEvent(
      new BadgeAwardedEvent({
        badgeId: this.id,
        userId,
        badgeName: this.name
      })
    )

    return Result.ok(undefined)
  }

  /**
   * Check if badge can be awarded based on conditions
   */
  canBeAwarded(userProgress: Record<string, any>): boolean {
    // Simple condition matching - in real implementation, this would be more complex
    for (const [key, value] of Object.entries(this.condition)) {
      if (!userProgress[key] || userProgress[key] < value) {
        return false
      }
    }

    return true
  }

  toObject(): BadgeProps & {
    id: string
    createdAt: Date
    updatedAt: Date
  } {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      imageId: this.imageId,
      rarity: this.rarity,
      condition: this.condition,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    }
  }

  clone(): Badge {
    return new Badge({ ...this._props }, this._id)
  }
}
