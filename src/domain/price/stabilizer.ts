export interface DetectedPrice {
  id: string;
  minor: bigint;
  currency: string;
  confidence: number;
  x: number;
  y: number;
  width?: number;
  height?: number;
}

interface TrackedPrice extends DetectedPrice {
  seenInLast3: boolean[];
  missedFrames: number;
}

/** How far (view px) a price may move between frames and still count as the same tag. */
const MATCH_RADIUS = 48;

function centre(p: DetectedPrice): { cx: number; cy: number } {
  return { cx: p.x + (p.width ?? 0) / 2, cy: p.y + (p.height ?? 0) / 2 };
}

/**
 * Keeps a price on screen once it shows in 2 of the last 3 frames, and drops it after
 * 3 missed frames (FR-3). Prices are matched across frames by value and nearest position,
 * not by the caller's id, so a hand-held box that jitters a few pixels keeps its identity.
 */
export function createStabilizer() {
  const tracked = new Map<string, TrackedPrice>();

  /** The tracked id this price continues, if any: same value, closest within MATCH_RADIUS. */
  function match(price: DetectedPrice, taken: Set<string>): string | undefined {
    const { cx, cy } = centre(price);
    const radius = Math.max(MATCH_RADIUS, (price.height ?? 0) * 1.5);
    let best: string | undefined;
    let bestDist = Infinity;
    for (const [id, t] of tracked) {
      if (taken.has(id) || t.minor !== price.minor || t.currency !== price.currency) continue;
      const c = centre(t);
      const dist = Math.hypot(c.cx - cx, c.cy - cy);
      if (dist <= radius && dist < bestDist) {
        best = id;
        bestDist = dist;
      }
    }
    return best;
  }

  return {
    addFrame(prices: DetectedPrice[]) {
      // Pair each detection with a tracked price (or start a new one).
      const seen = new Set<string>();
      const updates: Array<[string, DetectedPrice]> = [];
      for (const price of prices) {
        const id = match(price, seen) ?? price.id;
        seen.add(id);
        updates.push([id, price]);
      }

      // Update existing
      for (const [id, item] of tracked) {
        item.seenInLast3 = [...item.seenInLast3.slice(-2), seen.has(id)];
        item.missedFrames = seen.has(id) ? 0 : item.missedFrames + 1;
      }

      // Add new, move matched ones to their latest position
      for (const [id, price] of updates) {
        const t = tracked.get(id);
        if (!t) {
          tracked.set(id, { ...price, id, seenInLast3: [true], missedFrames: 0 });
        } else {
          Object.assign(t, price, { id });
        }
      }

      // Evict after 3 missed frames
      for (const [id, item] of tracked) {
        if (item.missedFrames >= 3) tracked.delete(id);
      }
    },

    stableItems(): DetectedPrice[] {
      return [...tracked.values()].filter(
        t => t.seenInLast3.filter(Boolean).length >= 2
      );
    },
  };
}
