/** Path the sign-in email links back to: beapp://auth/callback. */
export const AUTH_CALLBACK_PATH = 'auth/callback';

export type AuthCallback = { code: string } | { error: string };

/**
 * Read the query Supabase adds when its sign-in link sends the user back to the app:
 * `?code=…` (PKCE) on success, `?error_description=…` when the link expired or was used.
 * Supabase may put errors in the #fragment instead, so both are read.
 */
export function parseAuthCallback(params: Record<string, string | string[] | undefined>): AuthCallback | null {
  const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const error = first(params.error_description) ?? first(params.error);
  if (error) return { error: error.replace(/\+/g, ' ') };
  const code = first(params.code);
  return code ? { code } : null;
}

/** Pull query and fragment parameters out of a deep-link URL. */
export function urlParams(url: string): Record<string, string> {
  const out: Record<string, string> = {};
  const [, rest = ''] = url.split('?');
  const [query = '', fragment = ''] = rest.split('#');
  const hash = url.includes('#') && !url.includes('?') ? url.split('#')[1] ?? '' : fragment;
  for (const part of [query, hash].join('&').split('&')) {
    if (!part) continue;
    const [k, v = ''] = part.split('=');
    if (k) out[decodeURIComponent(k)] = decodeURIComponent(v.replace(/\+/g, ' '));
  }
  return out;
}
