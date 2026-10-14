import { describe, expect, it } from 'vitest';
import { allPairs, convertMinor, parseEcbDaily } from './fx';

const ECB = `<?xml version="1.0" encoding="UTF-8"?>
<gesmes:Envelope><Cube><Cube time='2026-10-12'>
  <Cube currency='USD' rate='1.1181'/>
  <Cube currency='JPY' rate='177.33'/>
  <Cube currency='PLN' rate='4.3850'/>
</Cube></Cube></gesmes:Envelope>`;

describe('parseEcbDaily', () => {
  it('reads the date and the per-euro rates, adding the euro itself', () => {
    expect(parseEcbDaily(ECB)).toEqual({
      asOf: '2026-10-12',
      perEuro: { EUR: 1, USD: 1.1181, JPY: 177.33, PLN: 4.385, SAR: 1.1181 * 3.75 },
    });
  });

  it('rejects a file without a date or without rates', () => {
    expect(parseEcbDaily('<html>maintenance</html>')).toBeNull();
    expect(parseEcbDaily("<Cube time='2026-10-12'></Cube>")).toBeNull();
  });

  it('skips zero rates', () => {
    const parsed = parseEcbDaily(`<Cube time='2026-10-12'><Cube currency='USD' rate='1.1'/><Cube currency='XXX' rate='0'/></Cube>`);
    expect(parsed?.perEuro).toEqual({ EUR: 1, USD: 1.1, SAR: 1.1 * 3.75 });
  });
});

describe('allPairs', () => {
  it('builds every cross rate, worth `rate` base per quote', () => {
    const pairs = allPairs({ EUR: 1, USD: 1.1181, JPY: 177.33 }, '2026-10-12');
    expect(pairs).toHaveLength(6);
    const eurToUsd = pairs.find((p) => p.base === 'USD' && p.quote === 'EUR')!;
    expect(eurToUsd.rate).toBeCloseTo(1.1181, 6);
    const jpyToUsd = pairs.find((p) => p.base === 'USD' && p.quote === 'JPY')!;
    expect(jpyToUsd.rate).toBeCloseTo(1.1181 / 177.33, 9);
    expect(jpyToUsd.asOf).toBe('2026-10-12');
  });
});

describe('convertMinor', () => {
  it('passes the home currency through unchanged', () => {
    expect(convertMinor(499n, 'USD', 'USD', undefined)).toBe(499n);
  });

  it('is null without a rate', () => {
    expect(convertMinor(499n, 'EUR', 'USD', null)).toBeNull();
  });

  it('converts between two-decimal currencies', () => {
    expect(convertMinor(499n, 'EUR', 'USD', 1.1181)).toBe(558n); // €4.99 → $5.58
  });

  it('scales yen (no minor unit) to cents and back', () => {
    expect(convertMinor(4600n, 'JPY', 'USD', 1.1181 / 177.33)).toBe(2900n); // ¥4,600 → $29.00
    expect(convertMinor(2900n, 'USD', 'JPY', 177.33 / 1.1181)).toBe(4599n);
  });
});
