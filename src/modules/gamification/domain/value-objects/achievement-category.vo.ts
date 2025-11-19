/**
 * Achievement Category Value Object
 */

export enum AchievementCategory {
  LEARNING = 'LEARNING',
  SOCIAL = 'SOCIAL',
  PROGRESS = 'PROGRESS',
  SPECIAL = 'SPECIAL'
}

export const AchievementCategoryValues = Object.values(AchievementCategory)

export function isValidAchievementCategory(value: string): value is AchievementCategory {
  return AchievementCategoryValues.includes(value as AchievementCategory)
}
