import { describe, it, expect, vi } from 'vitest';

vi.mock('expo-crypto', () => ({
  randomUUID: () => 'test-uuid-' + Math.random().toString(36).slice(2),
}));

import { recordConversion } from './record-conversion';
import type { ConversionRepository } from './ports/conversion-repository.port';

describe('recordConversion', () => {
  it('saves the conversion with a generated id', async () => {
    const repo: ConversionRepository = { save: vi.fn().mockResolvedValue(undefined) };

    await recordConversion(repo, {
      priceMinor: 6400n,
      currency: 'USD',
      hoursMinutes: 286,
      verdict: 'not_worth_it',
      source: 'freeze',
    });

    expect(repo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        id: expect.stringMatching(/^test-uuid-/),
        priceMinor: 6400n,
        hoursMinutes: 286,
        verdict: 'not_worth_it',
        source: 'freeze',
      }),
    );
  });
});
