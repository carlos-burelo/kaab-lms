/**
 * Badge Rarity Value Object
 */

export enum BadgeRarity {
  COMMON = 'COMMON',
  RARE = 'RARE',
  EPIC = 'EPIC',
  LEGENDARY = 'LEGENDARY'
}

export const BadgeRarityValues = Object.values(BadgeRarity)

export function isValidBadgeRarity(value: string): value is BadgeRarity {
  return BadgeRarityValues.includes(value as BadgeRarity)
}
