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

  it('keeps one label when the box jitters between frames', () => {
    const s = createStabilizer();
    // Same $64.00 tag; the caller's position-based id changes as the box moves a few px.
    s.addFrame([{ minor: 6400n, currency: 'USD', confidence: 1, id: '9-37', x: 214, y: 890, width: 120, height: 40 }]);
    s.addFrame([{ minor: 6400n, currency: 'USD', confidence: 1, id: '10-37', x: 229, y: 893, width: 120, height: 40 }]);
    s.addFrame([{ minor: 6400n, currency: 'USD', confidence: 1, id: '9-38', x: 220, y: 905, width: 118, height: 41 }]);

    const stable = s.stableItems();
    expect(stable).toHaveLength(1);
    expect(stable[0]!.id).toBe('9-37');   // identity kept from the first sighting
    expect(stable[0]!.x).toBe(220);       // position follows the latest frame
  });

  it('does not merge different prices or far-apart tags', () => {
    const s = createStabilizer();
    const a = { minor: 6400n, currency: 'USD', confidence: 1, id: 'a', x: 100, y: 100, width: 100, height: 40 };
    const b = { minor: 1400n, currency: 'USD', confidence: 1, id: 'b', x: 110, y: 100, width: 100, height: 40 };
    const c = { minor: 6400n, currency: 'USD', confidence: 1, id: 'c', x: 100, y: 600, width: 100, height: 40 };
    s.addFrame([a, b, c]);
    s.addFrame([a, b, c]);
    expect(s.stableItems().map(p => p.id).sort()).toEqual(['a', 'b', 'c']);
  });
});
