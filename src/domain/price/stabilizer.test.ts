import { describe, it, expect } from 'vitest';
import { createStabilizer } from './stabilizer';

describe('createStabilizer', () => {
  it('shows label only after 2 of 3 frames', () => {
    const s = createStabilizer();
    const price = { minor: 499n, currency: 'USD', confidence: 1, id: 'p1', x: 10, y: 10 };

    s.addFrame([price]);         // frame 1 — 1/3
    expect(s.stableItems()).toHaveLength(0);

    s.addFrame([price]);         // frame 2 — 2/3
    expect(s.stableItems()).toHaveLength(1);
  });

  it('removes label after 3 consecutive missed frames', () => {
    const s = createStabilizer();
    const price = { minor: 499n, currency: 'USD', confidence: 1, id: 'p1', x: 10, y: 10 };
    s.addFrame([price]);
    s.addFrame([price]);
    expect(s.stableItems()).toHaveLength(1);

    s.addFrame([]);
    s.addFrame([]);
    s.addFrame([]);
    expect(s.stableItems()).toHaveLength(0);
  });

  it('tracks multiple prices independently', () => {
    const s = createStabilizer();
    const p1 = { minor: 499n, currency: 'USD', confidence: 1, id: 'p1', x: 10, y: 10 };
    const p2 = { minor: 999n, currency: 'USD', confidence: 1, id: 'p2', x: 100, y: 100 };

    s.addFrame([p1, p2]);
    s.addFrame([p1, p2]);
    expect(s.stableItems()).toHaveLength(2);

    s.addFrame([p1]);
    s.addFrame([p1]);
    s.addFrame([p1]);
    expect(s.stableItems()).toHaveLength(1);
    expect(s.stableItems()[0]!.id).toBe('p1');
  });
});
