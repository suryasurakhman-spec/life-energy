import React from 'react';
import { Group, Rect, RoundedRect, Text as SkiaText } from '@shopify/react-native-skia';
import type { SkFont } from '@shopify/react-native-skia';
import { CHIP_TIERS } from '@/theme/chip-tiers';
import type { ChipTier } from '@/theme/chip-tiers';

interface Props {
  label: string;
  /** Left edge of the chip (already computed by LensScreen: boxX + boxWidth + 8). */
  x: number;
  /** Vertical center of the chip (already computed by LensScreen: boxY + boxHeight / 2). */
  y: number;
  tier: ChipTier;
  font: SkFont | null;
  /** Full camera frame width; used to clamp the chip inside the frame. */
  frameWidth?: number;
  // tap handled by parent Pressable overlay — not in Skia
}

const CHIP_H = 32;
const CHIP_PAD = 10;
const CHIP_R = 999;
const BORDER_COLOR = 'rgba(255,255,255,0.18)';

export function LabelChip({ label, x, y, tier, font, frameWidth }: Props) {
  if (!font) return null;

  const colors = CHIP_TIERS[tier];
  const textW = font.measureText(label).width;
  const chipW = textW + CHIP_PAD * 2;

  // If chip would overflow the right edge, flip it to the left of the bounding box
  // (caller passes x = boxX + boxWidth + 8; we move back by chipW + 16 to clear the box)
  const cx = frameWidth !== undefined && x + chipW > frameWidth ? x - chipW - 16 : x;
  // y is the vertical centre; offset up by half the chip height
  const cy = y - CHIP_H / 2;

  return (
    <Group>
      {/* Filled pill */}
      <RoundedRect
        x={cx}
        y={cy}
        width={chipW}
        height={CHIP_H}
        r={CHIP_R}
        color={colors.fill}
      />
      {/* T1: amber left bar accent */}
      {tier === 'T1' && (
        <Rect x={cx} y={cy} width={4} height={CHIP_H} color={CHIP_TIERS['T1'].leftBar!} />
      )}
      {/* 1 px white-tinted border so the chip reads on any background */}
      <RoundedRect
        x={cx}
        y={cy}
        width={chipW}
        height={CHIP_H}
        r={CHIP_R}
        color={BORDER_COLOR}
        style="stroke"
        strokeWidth={1}
      />
      {/* Label text — baseline sits at cy + CHIP_H/2 + 5 (visual centre for 15 pt Inter) */}
      <SkiaText
        x={cx + CHIP_PAD}
        y={cy + CHIP_H / 2 + 5}
        text={label}
        font={font}
        color={colors.text}
      />
    </Group>
  );
}
