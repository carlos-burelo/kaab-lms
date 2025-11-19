/**
 * UserGamification Aggregate Root
 */

import { AggregateRoot, type EntityProps } from '@/core/shared/aggregate-root';
import { Result } from '@/core/shared/result';
import { ValidationError, BusinessRuleError } from '@/core/shared/errors';
import { LevelUpEvent, XpAddedEvent, CoinsAddedEvent } from './events';

export interface UserGamificationProps extends EntityProps {
  userId: string;
  xp: number;
  level: number;
  coins: number;
  totalBadges: number;
  streak: number;
  lastActivity?: Date;
}

export class UserGamification extends AggregateRoot<UserGamificationProps> {
  // XP thresholds for each level (exponential growth)
  private static readonly XP_PER_LEVEL_BASE = 100;
  private static readonly XP_GROWTH_FACTOR = 1.5;

  get userId(): string {
    return this._props.userId;
  }

  get xp(): number {
    return this._props.xp;
  }

  get level(): number {
    return this._props.level;
  }

  get coins(): number {
    return this._props.coins;
  }

  get totalBadges(): number {
    return this._props.totalBadges;
  }

  get streak(): number {
    return this._props.streak;
  }

  get lastActivity(): Date | undefined {
    return this._props.lastActivity;
  }

  private constructor(props: UserGamificationProps, id?: string) {
    super(props, id);
  }

  /**
   * Create a new user gamification profile
   */
  static create(
    props: Omit<
      UserGamificationProps,
      'id' | 'xp' | 'level' | 'coins' | 'totalBadges' | 'streak' | 'createdAt' | 'updatedAt'
    >
  ): Result<UserGamification, ValidationError> {
    // Validations
    if (!props.userId || props.userId.trim().length === 0) {
      return Result.fail(
        new ValidationError('User ID is required', 'userId')
      );
    }

    const userGamification = new UserGamification(
      {
        ...props,
        xp: 0,
        level: 1,
        coins: 0,
        totalBadges: 0,
        streak: 0,
      },
      props.id
    );

    return Result.ok(userGamification);
  }

  /**
   * Calculate XP required for a specific level
   */
  static calculateXpForLevel(level: number): number {
    if (level <= 1) return 0;

    return Math.floor(
      UserGamification.XP_PER_LEVEL_BASE *
        UserGamification.XP_GROWTH_FACTOR ** (level - 1)
    );
  }

  /**
   * Calculate XP required to reach next level
   */
  getXpToNextLevel(): number {
    const nextLevelXp = UserGamification.calculateXpForLevel(this.level + 1);
    const currentLevelXp = UserGamification.calculateXpForLevel(this.level);
    return nextLevelXp - currentLevelXp;
  }

  /**
   * Get current progress towards next level (0-1)
   */
  getLevelProgress(): number {
    const currentLevelXp = UserGamification.calculateXpForLevel(this.level);
    const nextLevelXp = UserGamification.calculateXpForLevel(this.level + 1);
    const xpInCurrentLevel = this.xp - currentLevelXp;
    const xpNeededForLevel = nextLevelXp - currentLevelXp;

    return xpInCurrentLevel / xpNeededForLevel;
  }

  /**
   * Add XP to user
   */
  addXp(amount: number, reason: string): Result<void, ValidationError> {
    if (amount <= 0) {
      return Result.fail(
        new ValidationError('XP amount must be positive', 'amount')
      );
    }

    const previousLevel = this.level;
    this._props.xp += amount;

    // Check for level up
    const levelsGained = this.checkAndApplyLevelUp();

    // Emit XP added event
    this.addDomainEvent(
      new XpAddedEvent({
        userId: this.userId,
        amount,
        reason,
        totalXp: this.xp,
      })
    );

    // Emit level up events if applicable
    if (levelsGained > 0) {
      this.addDomainEvent(
        new LevelUpEvent({
          userId: this.userId,
          previousLevel,
          newLevel: this.level,
          currentXp: this.xp,
        })
      );
    }

    this.touch();

    return Result.ok(undefined);
  }

  /**
   * Add coins to user
   */
  addCoins(amount: number, reason: string): Result<void, ValidationError> {
    if (amount <= 0) {
      return Result.fail(
        new ValidationError('Coin amount must be positive', 'amount')
      );
    }

    this._props.coins += amount;

    // Emit coins added event
    this.addDomainEvent(
      new CoinsAddedEvent({
        userId: this.userId,
        amount,
        reason,
        totalCoins: this.coins,
      })
    );

    this.touch();

    return Result.ok(undefined);
  }

  /**
   * Spend coins
   */
  spendCoins(amount: number): Result<void, BusinessRuleError> {
    if (amount <= 0) {
      return Result.fail(
        new BusinessRuleError('Coin amount must be positive')
      );
    }

    if (this.coins < amount) {
      return Result.fail(
        new BusinessRuleError('Insufficient coins')
      );
    }

    this._props.coins -= amount;
    this.touch();

    return Result.ok(undefined);
  }

  /**
   * Award badge to user
   */
  awardBadge(): void {
    this._props.totalBadges += 1;
    this.touch();
  }

  /**
   * Update streak
   */
  updateStreak(): Result<void, BusinessRuleError> {
    const now = new Date();

    if (!this.lastActivity) {
      // First activity
      this._props.streak = 1;
      this._props.lastActivity = now;
      this.touch();
      return Result.ok(undefined);
    }

    const lastActivityDate = new Date(this.lastActivity);
    lastActivityDate.setHours(0, 0, 0, 0);

    const todayDate = new Date(now);
    todayDate.setHours(0, 0, 0, 0);

    const daysDifference = Math.floor(
      (todayDate.getTime() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDifference === 0) {
      // Same day, no streak update
      return Result.ok(undefined);
    } else if (daysDifference === 1) {
      // Consecutive day, increment streak
      this._props.streak += 1;
    } else {
      // Streak broken, reset to 1
      this._props.streak = 1;
    }

    this._props.lastActivity = now;
    this.touch();

    return Result.ok(undefined);
  }

  /**
   * Reset streak
   */
  resetStreak(): void {
    this._props.streak = 0;
    this.touch();
  }

  /**
   * Check and apply level up
   * Returns number of levels gained
   */
  private checkAndApplyLevelUp(): number {
    let levelsGained = 0;

    while (true) {
      const xpForNextLevel = UserGamification.calculateXpForLevel(
        this.level + 1
      );

      if (this.xp >= xpForNextLevel) {
        this._props.level += 1;
        levelsGained += 1;
      } else {
        break;
      }
    }

    return levelsGained;
  }

  toObject(): UserGamificationProps & {
    id: string;
    createdAt: Date;
    updatedAt: Date;
  } {
    return {
      id: this.id,
      userId: this.userId,
      xp: this.xp,
      level: this.level,
      coins: this.coins,
      totalBadges: this.totalBadges,
      streak: this.streak,
      lastActivity: this.lastActivity,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  clone(): UserGamification {
    return new UserGamification({ ...this._props }, this._id);
  }
}
