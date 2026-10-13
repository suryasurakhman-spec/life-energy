/**
 * delete-account: deletes the signed-in user's own Supabase account (FR-12).
 *
 * Deleting a user needs the service-role key, which never ships in the app, so the app
 * calls this function with its access token instead. The token decides whose account is
 * deleted; the request body is ignored, so a user can only delete themselves.
 *
 * Kept free of Deno and esm.sh imports so vitest can test it; index.ts wires the real client.
 */

export interface AccountAdmin {
  /** The user the access token belongs to, or null when it is missing, expired or forged. */
  userIdForToken(token: string): Promise<string | null>;
  deleteUser(userId: string): Promise<void>;
}

const json = (status: number, body: Record<string, string>) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

export async function handleDeleteAccount(req: Request, admin: AccountAdmin): Promise<Response> {
  if (req.method !== 'POST') return json(405, { error: 'method_not_allowed' });

  const token = req.headers.get('Authorization')?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) return json(401, { error: 'missing_token' });

  const userId = await admin.userIdForToken(token);
  if (!userId) return json(401, { error: 'invalid_token' });

  try {
    await admin.deleteUser(userId);
  } catch {
    return json(500, { error: 'delete_failed' });
  }
  return json(200, { deleted: userId });
}
