// src/theme/typography.ts
// All text styles for the Life Energy app.
// Font: Inter via @expo-google-fonts/inter
// All number-bearing styles should add fontVariant: ['tabular-nums'] at the usage site.

import type { TextStyle } from 'react-native';

export interface TypographyToken {
  fontSize: number;
  lineHeight: number;
  fontWeight: TextStyle['fontWeight'];
  fontFamily: string;
}

export const typography = {
  /** 48/52 700 — Wage reveal, hours on the label sheet */
  display: {
    fontSize: 48,
    lineHeight: 52,
    fontWeight: '700' as TextStyle['fontWeight'],
    fontFamily: 'Inter_700Bold',
  },
  /** 28/34 700 — Screen titles */
  title1: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700' as TextStyle['fontWeight'],
    fontFamily: 'Inter_700Bold',
  },
  /** 22/28 600 — Section headers, card titles */
  title2: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '600' as TextStyle['fontWeight'],
    fontFamily: 'Inter_600SemiBold',
  },
  /** 17/24 400 — Default text */
  body: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '400' as TextStyle['fontWeight'],
    fontFamily: 'Inter_400Regular',
  },
  /** 17/24 600 — Emphasis, list primaries */
  bodyStrong: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '600' as TextStyle['fontWeight'],
    fontFamily: 'Inter_600SemiBold',
  },
  /** 15/20 500 — Secondary info, prices beside hours */
  callout: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '500' as TextStyle['fontWeight'],
    fontFamily: 'Inter_500Medium',
  },
  /** 13/18 500 — Metadata, chart axes */
  caption: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500' as TextStyle['fontWeight'],
    fontFamily: 'Inter_500Medium',
  },
  /** 15/18 700 — Lens label chips; min 14 pt per PRD */
  chip: {
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '700' as TextStyle['fontWeight'],
    fontFamily: 'Inter_700Bold',
  },
} as const satisfies Record<string, TypographyToken>;

export type TypographyKey = keyof typeof typography;

/**
 * Raw font sizes for one-off text that doesn't take a whole typography token.
 * Components use these names instead of numbers (CLAUDE.md: no hard-coded sizes).
 */
export const fontSize = {
  tiny:    11,
  xs:      12,
  sm:      13,  // = caption
  md:      14,
  callout: 15,  // = callout, chip
  input:   16,
  body:    17,  // = body
  lg:      18,
  xl:      20,
  title2:  22,  // = title2
  title3:  24,
  glyph:   26,
  title1:  28,  // = title1
  xxl:     32,
  hero:    34,
  display: 48,  // = display
} as const;
