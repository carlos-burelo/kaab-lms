/**
 * Achievement Unlocked Domain Event
 */

import { DomainEvent } from '@/core/shared/domain-event';

export interface AchievementUnlockedEventPayload {
  achievementId: string;
  userId: string;
  achievementName: string;
  xpReward: number;
  coinReward: number;
}

export class AchievementUnlockedEvent extends DomainEvent<AchievementUnlockedEventPayload> {
  constructor(payload: AchievementUnlockedEventPayload) {
    super('achievement.unlocked', payload);
  }
}
