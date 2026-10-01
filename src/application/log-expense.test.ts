import { describe, it, expect, vi } from 'vitest';

vi.mock('expo-crypto', () => ({
  randomUUID: () => 'test-uuid-' + Math.random().toString(36).slice(2),
}));

import { logExpense } from './log-expense';
import type { ExpenseRepository } from './ports/expense-repository.port';

describe('logExpense', () => {
  it('saves the expense with a generated id', async () => {
    const repo: ExpenseRepository = {
      save: vi.fn().mockResolvedValue(undefined),
      findByMonth: vi.fn(), findAll: vi.fn(), delete: vi.fn(), exportAll: vi.fn(),
    };

    await logExpense(repo, {
      amountMinor: 1299n,
      currency: 'USD',
      wageProfileId: 'wp-1',
      source: 'lens',
      spentAt: new Date('2026-09-30'),
    });

    expect(repo.save).toHaveBeenCalledWith(
      expect.objectContaining({ amountMinor: 1299n, source: 'lens' })
    );
  });

  it('generates a unique id for each expense', async () => {
    const saved: string[] = [];
    const repo: ExpenseRepository = {
      save: vi.fn().mockImplementation(async (e) => { saved.push(e.id); }),
      findByMonth: vi.fn(), findAll: vi.fn(), delete: vi.fn(), exportAll: vi.fn(),
    };

    await logExpense(repo, { amountMinor: 100n, currency: 'USD', wageProfileId: 'w1', source: 'keypad', spentAt: new Date() });
    await logExpense(repo, { amountMinor: 200n, currency: 'USD', wageProfileId: 'w1', source: 'keypad', spentAt: new Date() });

    expect(saved[0]).toBeTruthy();
    expect(saved[0]).not.toBe(saved[1]);
  });
});
