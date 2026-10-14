/**
 * Price-tag exam (FR-1 accuracy): scores the lens parser against hand-labelled photos.
 *
 * The OCR step ran on a device (scripts/price-exam.sh) and is stored as a snapshot,
 * so this test re-scores parser changes without a phone. Each photo is read as a shopper
 * from its country would: the labelled currency is the home currency. A tag counts as found
 * when the photo yields a price with the same amount and currency. Real prices in `also_ok`
 * (unit, regular, crossed-out) may show; any other price read from the photo is a wrong chip.
 */
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';
import { describe, expect, it } from 'vitest';
import { minorDigits } from '@/domain/price/parser';
import {
  ocrLinesFromBlocks,
  pricesInLines,
  type MlKitBlock,
} from '@/presentation/screens/lens/ocr-prices';

const DIR = resolve(__dirname, 'fixtures/price-tags');
const OCR_FILE = resolve(DIR, 'ocr-android.json');

interface Item {
  id: string;
  kind: string;
  region: string;
  currency: string;
  scope?: string;
  tags: { price: string; text: string }[];
  also_ok: string[];
}

/** Dollar-sign countries outside the US (labelled DOLLAR_OTHER) and Chile write "$", which the lens reads as US dollars. */
const DOLLAR_SIGN = new Set(['USD', 'DOLLAR_OTHER', 'CLP']);

/** The shopper's home currency; the lens has no per-country dollar, so "$" countries count as USD. */
const homeOf = (currency: string) => (currency === 'DOLLAR_OTHER' ? 'USD' : currency);

/** Matches one labelled price, in the home currency or (for "$" countries) as US dollars. */
function matcher(price: string, currency: string) {
  const home = homeOf(currency);
  const major = Number(price);
  return (found: { minor: bigint; currency: string }) => {
    if (found.currency === home) {
      return found.minor === BigInt(Math.round(major * 10 ** minorDigits(home)));
    }
    return DOLLAR_SIGN.has(currency) && found.currency === 'USD' && found.minor === BigInt(Math.round(major * 100));
  };
}

/** Removes the first price in `pool` matching `price`; true when one was found. */
function take(pool: { minor: bigint; currency: string }[], price: string, currency: string): boolean {
  const at = pool.findIndex(matcher(price, currency));
  if (at < 0) return false;
  pool.splice(at, 1);
  return true;
}

interface Score {
  photos: number;
  tags: number;
  found: number;
  wrong: number;
  allFound: number;
}

const empty = (): Score => ({ photos: 0, tags: 0, found: 0, wrong: 0, allFound: 0 });
const pct = (n: number, d: number) => (d === 0 ? '—' : `${Math.round((100 * n) / d)}%`);

describe.skipIf(!existsSync(OCR_FILE))('price-tag exam', () => {
  const labels: { items: Item[] } = JSON.parse(readFileSync(resolve(DIR, 'labels.json'), 'utf8'));
  const ocr: { engine: string; results: Record<string, { ms: number; blocks: MlKitBlock[] }> } =
    JSON.parse(readFileSync(OCR_FILE, 'utf8'));
  // Menu photos are a v3 feature; keep them in the set but out of the MVP score.
  const items = labels.items.filter((i) => !i.scope);

  const groups = new Map<string, Score>();
  const misses: string[] = [];
  const add = (group: string, s: Score) => {
    const g = groups.get(group) ?? empty();
    for (const k of Object.keys(s) as (keyof Score)[]) g[k] += s[k];
    groups.set(group, g);
  };

  for (const item of items) {
    const result = ocr.results[item.id];
    const lines = result ? ocrLinesFromBlocks(result.blocks) : [];
    const pool = pricesInLines(lines, homeOf(item.currency));
    let found = 0;
    const missed: string[] = [];
    for (const tag of item.tags) {
      if (take(pool, tag.price, item.currency)) found += 1;
      else missed.push(tag.price);
    }
    for (const price of item.also_ok) take(pool, price, item.currency);
    const score: Score = {
      photos: 1,
      tags: item.tags.length,
      found,
      wrong: pool.length,
      allFound: found === item.tags.length ? 1 : 0,
    };
    add('all', score);
    add(item.region === 'US' && item.kind !== 'fuel' ? 'US shop' : item.region === 'US' ? 'US fuel' : 'other countries', score);
    if (missed.length || pool.length) {
      const read = pool.map((p) => `${p.minor}${p.currency === 'USD' ? '¢' : ' ' + p.currency}`);
      misses.push(
        `${item.id} ${item.kind.padEnd(11)} missed [${missed.join(', ')}]  wrong [${read.join(', ')}]`,
      );
    }
  }

  const ms = Object.values(ocr.results).map((r) => r.ms).sort((a, b) => a - b);
  const p90 = ms[Math.floor(ms.length * 0.9)] ?? 0;
  const rows = [...groups.entries()].map(
    ([name, s]) =>
      `${name.padEnd(16)} ${String(s.photos).padStart(3)} photos  ${String(s.tags).padStart(3)} tags  ` +
      `found ${String(s.found).padStart(3)} (${pct(s.found, s.tags).padStart(4)})  wrong chips ${String(s.wrong).padStart(3)}  ` +
      `every tag on photo ${pct(s.allFound, s.photos).padStart(4)}`,
  );
  console.log(
    [`Engine: ${ocr.engine}   OCR time p90 ${p90} ms`, ...rows, '', ...misses].join('\n'),
  );

  // First run (2026-10-13) found 17 of 127 tags; parser fixes took it to 48 with 5 wrong chips.
  // Batch 2 (2026-10-14, 40 more photos) brought it to 76 of 207 with 9 wrong chips;
  // skipping savings and gift-card amounts cut that to 7.
  // Raise these as the parser improves, so a change can't quietly lose ground.
  it('finds at least the recorded number of tags without adding wrong chips', () => {
    const all = groups.get('all')!;
    expect(all.found).toBeGreaterThanOrEqual(76);
    expect(all.wrong).toBeLessThanOrEqual(7);
  });
});
