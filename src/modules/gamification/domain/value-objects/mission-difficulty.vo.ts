/**
 * Mission Difficulty Value Object
 */

export enum MissionDifficulty {
  EASY = 'EASY',
  NORMAL = 'NORMAL',
  HARD = 'HARD',
  EXPERT = 'EXPERT'
}

export const MissionDifficultyValues = Object.values(MissionDifficulty)

export function isValidMissionDifficulty(value: string): value is MissionDifficulty {
  return MissionDifficultyValues.includes(value as MissionDifficulty)
}
