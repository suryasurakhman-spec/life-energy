import { describe, expect, it } from 'vitest';
import { parseAuthCallback, urlParams } from './auth-callback';

describe('parseAuthCallback', () => {
  it('reads the PKCE code', () => {
    expect(parseAuthCallback({ code: 'abc' })).toEqual({ code: 'abc' });
    expect(parseAuthCallback({ code: ['abc', 'x'] })).toEqual({ code: 'abc' });
  });

  it('prefers the readable error over the code', () => {
    expect(parseAuthCallback({ error: 'access_denied', error_description: 'Email+link+is+invalid' }))
      .toEqual({ error: 'Email link is invalid' });
    expect(parseAuthCallback({ error: 'access_denied' })).toEqual({ error: 'access_denied' });
  });

  it('is null when the link carries neither', () => {
    expect(parseAuthCallback({})).toBeNull();
  });
});

describe('urlParams', () => {
  it('reads query parameters', () => {
    expect(urlParams('beapp://auth/callback?code=a%2Fb')).toEqual({ code: 'a/b' });
  });

  it('reads errors from the fragment, with or without a query', () => {
    expect(urlParams('beapp://auth/callback#error=access_denied&error_description=Link+expired'))
      .toEqual({ error: 'access_denied', error_description: 'Link expired' });
    expect(urlParams('beapp://auth/callback?x=1#error=e')).toEqual({ x: '1', error: 'e' });
  });

  it('is empty for a bare URL', () => {
    expect(urlParams('beapp://auth/callback')).toEqual({});
  });
});
