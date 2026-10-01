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

export function createStabilizer() {
  const tracked = new Map<string, TrackedPrice>();

  return {
    addFrame(prices: DetectedPrice[]) {
      const seenIds = new Set(prices.map(p => p.id));

      // Update existing
      for (const [id, item] of tracked) {
        item.seenInLast3 = [...item.seenInLast3.slice(-2), seenIds.has(id)];
        item.missedFrames = seenIds.has(id) ? 0 : item.missedFrames + 1;
      }

      // Add new
      for (const price of prices) {
        if (!tracked.has(price.id)) {
          tracked.set(price.id, { ...price, seenInLast3: [true], missedFrames: 0 });
        } else {
          const t = tracked.get(price.id)!;
          Object.assign(t, price); // update position
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
