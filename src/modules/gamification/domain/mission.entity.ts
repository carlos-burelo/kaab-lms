/**
 * Mission Aggregate Root
 */

import { AggregateRoot, type EntityProps } from '@/core/shared/aggregate-root'
import { BusinessRuleError, ValidationError } from '@/core/shared/errors'
import { Result } from '@/core/shared/result'
import { MissionCompletedEvent } from './events'
import type { MissionDifficulty, MissionType } from './value-objects'

export interface MissionProps extends EntityProps {
  title: string
  description: string
  type: MissionType
  difficulty: MissionDifficulty
  xpReward: number
  coinReward: number
  startDate?: Date
  endDate?: Date
}

export class Mission extends AggregateRoot<MissionProps> {
  get title(): string {
    return this._props.title
  }

  get description(): string {
    return this._props.description
  }

  get type(): MissionType {
    return this._props.type
  }

  get difficulty(): MissionDifficulty {
    return this._props.difficulty
  }

  get xpReward(): number {
    return this._props.xpReward
  }

  get coinReward(): number {
    return this._props.coinReward
  }

  get startDate(): Date | undefined {
    return this._props.startDate
  }

  get endDate(): Date | undefined {
    return this._props.endDate
  }

  private constructor(props: MissionProps, id?: string) {
    super(props, id)
  }

  /**
   * Create a new mission
   */
  static create(props: Omit<MissionProps, 'id' | 'createdAt' | 'updatedAt'>): Result<Mission, ValidationError> {
    // Validations
    if (props.title.trim().length < 3) {
      return Result.fail(new ValidationError('Mission title must be at least 3 characters', 'title'))
    }

    if (props.description.trim().length < 10) {
      return Result.fail(new ValidationError('Mission description must be at least 10 characters', 'description'))
    }

    if (props.xpReward < 0) {
      return Result.fail(new ValidationError('XP reward cannot be negative', 'xpReward'))
    }

    if (props.coinReward < 0) {
      return Result.fail(new ValidationError('Coin reward cannot be negative', 'coinReward'))
    }

    if (props.startDate && props.endDate && props.startDate >= props.endDate) {
      return Result.fail(new ValidationError('End date must be after start date', 'endDate'))
    }

    const mission = new Mission(props, props.id)

    return Result.ok(mission)
  }

  /**
   * Update mission title
   */
  updateTitle(newTitle: string): Result<void, ValidationError> {
    if (newTitle.trim().length < 3) {
      return Result.fail(new ValidationError('Mission title must be at least 3 characters', 'title'))
    }

    this._props.title = newTitle
    this.touch()

    return Result.ok(undefined)
  }

  /**
   * Update mission description
   */
  updateDescription(newDescription: string): Result<void, ValidationError> {
    if (newDescription.trim().length < 10) {
      return Result.fail(new ValidationError('Mission description must be at least 10 characters', 'description'))
    }

    this._props.description = newDescription
    this.touch()

    return Result.ok(undefined)
  }

  /**
   * Update mission type
   */
  updateType(type: MissionType): void {
    this._props.type = type
    this.touch()
  }

  /**
   * Update mission difficulty
   */
  updateDifficulty(difficulty: MissionDifficulty): void {
    this._props.difficulty = difficulty
    this.touch()
  }

  /**
   * Update XP reward
   */
  updateXpReward(xpReward: number): Result<void, ValidationError> {
    if (xpReward < 0) {
      return Result.fail(new ValidationError('XP reward cannot be negative', 'xpReward'))
    }

    this._props.xpReward = xpReward
    this.touch()

    return Result.ok(undefined)
  }

  /**
   * Update coin reward
   */
  updateCoinReward(coinReward: number): Result<void, ValidationError> {
    if (coinReward < 0) {
      return Result.fail(new ValidationError('Coin reward cannot be negative', 'coinReward'))
    }

    this._props.coinReward = coinReward
    this.touch()

    return Result.ok(undefined)
  }

  /**
   * Update mission dates
   */
  updateDates(startDate?: Date, endDate?: Date): Result<void, ValidationError> {
    if (startDate && endDate && startDate >= endDate) {
      return Result.fail(new ValidationError('End date must be after start date', 'endDate'))
    }

    this._props.startDate = startDate
    this._props.endDate = endDate
    this.touch()

    return Result.ok(undefined)
  }

  /**
   * Start mission
   */
  start(): Result<void, BusinessRuleError> {
    const now = new Date()

    if (this.startDate && this.startDate > now) {
      return Result.fail(new BusinessRuleError('Mission has not started yet'))
    }

    if (this.endDate && this.endDate < now) {
      return Result.fail(new BusinessRuleError('Mission has already ended'))
    }

    return Result.ok(undefined)
  }

  /**
   * Complete mission for user
   */
  complete(userId: string): Result<void, BusinessRuleError> {
    if (!userId || userId.trim().length === 0) {
      return Result.fail(new BusinessRuleError('User ID is required'))
    }

    if (!this.isActive()) {
      return Result.fail(new BusinessRuleError('Mission is not currently active'))
    }

    if (this.isExpired()) {
      return Result.fail(new BusinessRuleError('Mission has expired'))
    }

    // Emit domain event
    this.addDomainEvent(
      new MissionCompletedEvent({
        missionId: this.id,
        userId,
        missionTitle: this.title,
        xpReward: this.xpReward,
        coinReward: this.coinReward
      })
    )

    return Result.ok(undefined)
  }

  /**
   * Check if mission is currently active
   */
  isActive(): boolean {
    const now = new Date()

    if (this.startDate && this.startDate > now) {
      return false
    }

    if (this.endDate && this.endDate < now) {
      return false
    }

    return true
  }

  /**
   * Check if mission has expired
   */
  isExpired(): boolean {
    if (!this.endDate) {
      return false
    }

    return this.endDate < new Date()
  }

  /**
   * Check if mission has started
   */
  hasStarted(): boolean {
    if (!this.startDate) {
      return true
    }

    return this.startDate <= new Date()
  }

  toObject(): MissionProps & {
    id: string
    createdAt: Date
    updatedAt: Date
  } {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      type: this.type,
      difficulty: this.difficulty,
      xpReward: this.xpReward,
      coinReward: this.coinReward,
      startDate: this.startDate,
      endDate: this.endDate,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    }
  }

  clone(): Mission {
    return new Mission({ ...this._props }, this._id)
  }
}
