// src/theme/chip-tiers.ts
// Time-weight scale for label chips.
// Chips get warmer as the cost grows — same hue, rising intensity. Informative, not alarming.

import { palette } from '@/theme/colors';

export type ChipTier = 'T0' | 'T1' | 'T2' | 'T3' | 'T4';

export interface TierStyle {
  tier: ChipTier;
  /** Label (for debugging / accessibility) */
  label: string;
  /** Background color or rgba string for the chip fill */
  fill: string;
  /** Text color */
  text: string;
  /** Optional left-bar accent color (T1 only) */
  leftBar?: string;
}

export const CHIP_TIERS: Record<ChipTier, TierStyle> = {
  T0: {
    tier: 'T0',
    label: '< 15 min',
    fill: 'rgba(17,15,13,0.72)',
    text: palette.sand50,
  },
  T1: {
    tier: 'T1',
    label: '15 min – 1 h',
    fill: 'rgba(17,15,13,0.80)',
    text: palette.sand50,
    leftBar: palette.amber300,
  },
  T2: {
    tier: 'T2',
    label: '1 h – 1 work day',
    fill: palette.amber300,
    text: palette.sand950,
  },
  T3: {
    tier: 'T3',
    label: '1 – 5 work days',
    fill: palette.amber500,
    text: palette.sand950,
  },
  T4: {
    tier: 'T4',
    label: '> 1 work week',
    fill: palette.amber700,
    text: '#FFFFFF',
  },
} as const;

/**
 * Returns the chip tier for a given life-energy cost.
 *
 * @param totalMinutes - The computed life-energy cost in minutes (price / realHourlyWage * 60).
 * @param workDayMinutes - The user's real work day length in minutes (paid + job-related hours).
 *                         Defaults to 480 (8 h) if not provided.
 */
export function getTier(totalMinutes: number, workDayMinutes = 480): ChipTier {
  if (totalMinutes < 15) return 'T0';
  if (totalMinutes < 60) return 'T1';

  const workDayMins = workDayMinutes > 0 ? workDayMinutes : 480;

  if (totalMinutes < workDayMins) return 'T2';

  const fiveWorkDayMins = workDayMins * 5;
  if (totalMinutes < fiveWorkDayMins) return 'T3';

  return 'T4';
}
