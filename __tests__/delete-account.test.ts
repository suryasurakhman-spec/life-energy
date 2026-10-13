import { describe, expect, it, vi } from 'vitest';
import { handleDeleteAccount, type AccountAdmin } from '../supabase/functions/delete-account/handler';

const admin = (overrides: Partial<AccountAdmin> = {}): AccountAdmin => ({
  userIdForToken: vi.fn(async (token: string) => (token === 'good' ? 'user-1' : null)),
  deleteUser: vi.fn(async () => {}),
  ...overrides,
});

const post = (headers: Record<string, string> = {}, body?: string) =>
  new Request('https://x.supabase.co/functions/v1/delete-account', { method: 'POST', headers, ...(body ? { body } : {}) });

describe('delete-account function', () => {
  it('deletes the user the token belongs to', async () => {
    const a = admin();
    const res = await handleDeleteAccount(post({ Authorization: 'Bearer good' }), a);
    expect(res.status).toBe(200);
    expect(a.deleteUser).toHaveBeenCalledWith('user-1');
  });

  it('ignores a user id in the body, so nobody can delete someone else', async () => {
    const a = admin();
    await handleDeleteAccount(post({ Authorization: 'Bearer good' }, JSON.stringify({ userId: 'user-2' })), a);
    expect(a.deleteUser).toHaveBeenCalledWith('user-1');
  });

  it('refuses a request without a token', async () => {
    const a = admin();
    const res = await handleDeleteAccount(post(), a);
    expect(res.status).toBe(401);
    expect(a.deleteUser).not.toHaveBeenCalled();
  });

  it('refuses an expired or forged token', async () => {
    const a = admin();
    const res = await handleDeleteAccount(post({ Authorization: 'Bearer forged' }), a);
    expect(res.status).toBe(401);
    expect(a.deleteUser).not.toHaveBeenCalled();
  });

  it('refuses anything but POST', async () => {
    const res = await handleDeleteAccount(
      new Request('https://x.supabase.co/functions/v1/delete-account', { headers: { Authorization: 'Bearer good' } }),
      admin(),
    );
    expect(res.status).toBe(405);
  });

  it('reports a failed delete', async () => {
    const res = await handleDeleteAccount(
      post({ Authorization: 'Bearer good' }),
      admin({ deleteUser: vi.fn(async () => { throw new Error('db down'); }) }),
    );
    expect(res.status).toBe(500);
  });
});
