import { describe, it, expect } from 'vitest';
import { ok, err, isOk, isErr } from './result';

describe('Result', () => {
  it('ok wraps a value', () => {
    const r = ok(42);
    expect(isOk(r)).toBe(true);
    if (isOk(r)) expect(r.value).toBe(42);
  });

  it('err wraps an error', () => {
    const r = err(new Error('fail'));
    expect(isErr(r)).toBe(true);
    if (isErr(r)) expect(r.error.message).toBe('fail');
  });

  it('ok is not err', () => {
    expect(isErr(ok(1))).toBe(false);
  });

  it('err is not ok', () => {
    expect(isOk(err('bad'))).toBe(false);
  });
});
