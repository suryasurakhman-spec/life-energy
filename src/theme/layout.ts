// src/theme/layout.ts
import type { ShadowStyleIOS } from 'react-native';

export const space = {
  xxs:  2,
  xs:   4,
  sm:   8,
  md:   12,
  lg:   16,
  xl:   24,
  xxl:  32,
  xxxl: 48,
} as const;

export const radius = {
  sm:   8,
  md:   12,
  lg:   16,
  xl:   24,
  pill: 999,
} as const;

/** Minimum touch target size in points (44 pt per Apple HIG and PRD). */
export const hitSlop = 44 as const;

/** Standard hit slop object for Pressable / TouchableOpacity components. */
export const hitSlopRect = {
  top:    hitSlop,
  right:  hitSlop,
  bottom: hitSlop,
  left:   hitSlop,
} as const;

/** iOS shadow — one level only, for sheets and floating buttons. */
export const shadow: ShadowStyleIOS & { elevation: number } = {
  shadowColor:   '#000000',
  shadowOpacity: 0.12,
  shadowRadius:  16,
  shadowOffset:  { width: 0, height: 4 },
  elevation:     6, // Android
};

/** Screen horizontal gutter (pt). */
export const screenGutter = space.lg; // 16

/** Internal card padding (pt). */
export const cardPadding = space.lg; // 16

/** Vertical gap between cards (pt). */
export const cardGap = space.md; // 12
