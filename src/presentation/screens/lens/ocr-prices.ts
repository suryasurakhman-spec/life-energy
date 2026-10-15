import { parsePrice } from '@/lib/priceParser';
import { minorDigits, parsePrice as parseForeignPrice } from '@/domain/price/parser';
import type { DetectedPrice } from '@/domain/price/stabilizer';

/** OCR text with its box (top-left corner + size). */
export interface OcrBox {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

/** One OCR line plus its words: multi-word tags ("$3 99", "Was $5 Now $3") only parse as a line. */
export interface OcrLine extends OcrBox {
  words: OcrBox[];
}

type ParsedTag = Omit<DetectedPrice, 'id' | 'x' | 'y' | 'width' | 'height'>;

/** Any currency sign or local marker on the tag; without one the price is in the home currency. */
const CURRENCY_MARK = /[$¢€£¥₩₹]|Rp|zł/i;

/**
 * ML Kit often reads a "$" as "S" or "s" ("S22,90", "s99.90", "S 1.99"). Only a full amount with
 * cents is corrected, so words and codes that start with S stay as they are.
 * Japanese tags end a price with a dash or tilde ("¥4,600-", "¥7,600~"), which is dropped.
 * ML Kit's Latin model reads "¥" as "F" ("F4,725~"); only a whole amount in thousands groups is fixed.
 */
function fixOcrNoise(text: string): string {
  return text
    .trim()
    .replace(/(\d)[-~)]+$/, '$1')
    .replace(/^[Ss] ?(?=\d{1,4}[.,]\d{2}$)/, '$')
    .replace(/^F(?=\d{1,3}(?:,\d{3})+$)/, '¥');
}

/**
 * US tags go through the full parser (FR-2). When it flags a non-USD price, or can't read
 * the text at all, the currency-aware parser gets a chance (FR-18 foreign prices).
 * The US parser reports unmarked amounts (".99") as dollars; a tag with no currency
 * marker is in the shopper's own currency, so those are re-read in `homeCurrency`.
 */
export function parseTag(rawText: string, homeCurrency = 'USD'): ParsedTag | null {
  const text = fixOcrNoise(rawText);
  const usd = parsePrice(text);
  if (usd && usd.currency !== 'NOT_USD') {
    if (homeCurrency === 'USD' || CURRENCY_MARK.test(text)) return usd;
    const scale = 10n ** BigInt(2 - minorDigits(homeCurrency));
    return { ...usd, minor: (usd.minor + scale / 2n) / scale, currency: homeCurrency };
  }
  const foreign = parseForeignPrice(text);
  if (foreign && foreign.currency !== 'USD') return foreign;
  // OCR glues stray letters or a misread "$" to the amount ("AIMS9.98", "¢2.99").
  // Only amounts with cents, and never a currency code, which would turn into dollars.
  // Letters ending in O, I or l are usually misread digits ("Oo1.09" was the date 02.01.09).
  const glued = text.match(/^([A-Za-z¢]*[A-HJ-NP-Za-kmnp-z¢])(\d{1,4}[.,]\d{2})$/);
  return glued && !CURRENCY_CODE.test(glued[1]!) ? parseTag(glued[2]!, homeCurrency) : null;
}

/** Codes of the currencies the app reads (SUPPORTED_CURRENCIES in the currency store). */
const CURRENCY_CODE = /^(?:USD|EUR|GBP|CAD|AUD|NZD|SGD|HKD|JPY|CNY|KRW|IDR|MXN|SAR)$/i;

/** Grade names on a fuel price board. */
const FUEL_WORDS =
  /\b(?:UNL|UNLEADED|REG|REGULAR|MID|MIDGRADE|PLUS|PREM|PREMIUM|SUPER|ULTRA|DIESEL|GAS|GASOLINE|E85)\b/i;

/** Words only a fuel board uses; grade words alone ("Plus", "Premium") also name shop products. */
const FUEL_ONLY_WORDS = /\b(?:UNL|UNLEADED|MIDGRADE|DIESEL|GAS|GASOLINE|E85)\b/i;

/** A fuel board: a fuel-only word, or two different grade names in view. */
function isFuelBoard(lines: OcrLine[]): boolean {
  const grades = new Set<string>();
  for (const l of lines) {
    if (FUEL_ONLY_WORDS.test(l.text)) return true;
    for (const m of l.text.matchAll(new RegExp(FUEL_WORDS.source, 'gi'))) grades.add(m[0].toUpperCase());
  }
  return grades.size >= 2;
}

/**
 * Fuel boards print "$3.39⁹" with a small tenth-of-a-cent 9, and OCR drops the dot:
 * "3399", "349", "2.891", or reads the ⁹⁄₁₀ as "%": "484%". Read as dollars, cents dropped past the second place.
 * Only used when a grade name is in view, since bare 3–4 digit numbers are usually codes.
 */
function parseFuelPrice(text: string, homeCurrency: string): ParsedTag | null {
  const m = text.match(/^([1-9])\.?(\d{2})[\d%]?$/);
  return m ? parseTag(`${m[1]}.${m[2]}`, homeCurrency) : null;
}

/** Savings, coupons and gift cards print an amount that is not what the item costs. */
const PROMO_WORDS = /\b(?:SAVE|SAVINGS|OFF|FREE|COUPON|REBATE|GIFT\s?CARD)\b|GIFTCARD/i;

/** Every price in one OCR pass, each with the box it was read from. */
export function pricesInLines(lines: OcrLine[], homeCurrency = 'USD'): DetectedPrice[] {
  const fuelBoard = isFuelBoard(lines);
  const detected: DetectedPrice[] = [];
  const add = (box: OcrBox, parsed: ParsedTag) => {
    detected.push({
      id: `${Math.round(box.x / 24)}-${Math.round(box.y / 24)}`,
      ...parsed,
      x: box.x,
      y: box.y,
      width: box.width,
      height: box.height,
    });
  };
  for (const line of lines) {
    if (PROMO_WORDS.test(line.text)) continue;
    // Whole line first, so split-cent, sale and "with card" tags read as one price.
    const singleWord = line.words.length === 1 && line.words[0]!.text === line.text.trim();
    const whole = singleWord ? null : parseTag(line.text, homeCurrency);
    if (whole) {
      add(line, whole);
      continue;
    }
    for (const w of line.words) {
      const parsed =
        (fuelBoard ? parseFuelPrice(w.text, homeCurrency) : null) ?? parseTag(w.text, homeCurrency);
      if (parsed) add(w, parsed);
    }
  }
  return detected;
}

interface MlKitFrame {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

/** ML Kit blocks as the text-recognition plugin returns them (frames are centre points). */
export interface MlKitBlock {
  lines?: {
    lineText?: string;
    lineFrame?: MlKitFrame;
    elements?: { elementText?: string; elementFrame?: MlKitFrame }[];
  }[];
}

/**
 * Turn plugin blocks into OCR lines in image space, keeping only text with a digit or a
 * fuel grade name (which marks a price board) — the same filter the frame processor applies.
 */
export function ocrLinesFromBlocks(blocks: MlKitBlock[]): OcrLine[] {
  const box = (f: MlKitFrame | undefined, text: string): OcrBox => {
    const width = f?.width ?? 0;
    const height = f?.height ?? 0;
    return { text, x: (f?.x ?? 0) - width / 2, y: (f?.y ?? 0) - height / 2, width, height };
  };
  const lines: OcrLine[] = [];
  for (const block of blocks) {
    for (const line of block.lines ?? []) {
      const lineText = line.lineText ?? '';
      if (!/\d/.test(lineText) && !FUEL_WORDS.test(lineText)) continue;
      const words = (line.elements ?? [])
        .filter((el) => /\d/.test(el.elementText ?? ''))
        .map((el) => box(el.elementFrame, el.elementText ?? ''));
      lines.push({ ...box(line.lineFrame, lineText), words });
    }
  }
  return lines;
}
