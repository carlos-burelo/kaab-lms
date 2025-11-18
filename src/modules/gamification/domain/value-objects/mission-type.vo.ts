/**
 * Mission Type Value Object
 */

export enum MissionType {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  SPECIAL = 'SPECIAL',
}

export const MissionTypeValues = Object.values(MissionType);

export function isValidMissionType(value: string): value is MissionType {
  return MissionTypeValues.includes(value as MissionType);
}
