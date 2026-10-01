// src/theme/index.ts
// Central export for all design tokens.
// useTheme() returns the correct light/dark token set based on the system color scheme.

export { palette, light, dark } from './colors';
export type { ColorTokens } from './colors';

export { typography } from './typography';
export type { TypographyKey, TypographyToken } from './typography';

export { space, radius, hitSlop, hitSlopRect, shadow, screenGutter, cardPadding, cardGap } from './layout';

export { CHIP_TIERS, getTier } from './chip-tiers';
export type { ChipTier, TierStyle } from './chip-tiers';

import { useColorScheme } from 'react-native';
import { light, dark } from './colors';
import type { ColorTokens } from './colors';

/**
 * Returns the correct color token set for the current system color scheme.
 * The lens is always rendered in dark chrome regardless of this hook's return value —
 * lens components should import `dark` directly.
 */
export function useTheme(): ColorTokens {
  const scheme = useColorScheme();
  return scheme === 'dark' ? dark : light;
}
