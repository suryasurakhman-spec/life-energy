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
 * US tags go through the full parser (FR-2). When it flags a non-USD price, or can't read
 * the text at all, the currency-aware parser gets a chance (FR-18 foreign prices).
 * The US parser reports unmarked amounts (".99") as dollars; a tag with no currency
 * marker is in the shopper's own currency, so those are re-read in `homeCurrency`.
 */
export function parseTag(text: string, homeCurrency = 'USD'): ParsedTag | null {
  const usd = parsePrice(text);
  if (usd && usd.currency !== 'NOT_USD') {
    if (homeCurrency === 'USD' || CURRENCY_MARK.test(text)) return usd;
    const scale = 10n ** BigInt(2 - minorDigits(homeCurrency));
    return { ...usd, minor: (usd.minor + scale / 2n) / scale, currency: homeCurrency };
  }
  const foreign = parseForeignPrice(text);
  return foreign && foreign.currency !== 'USD' ? foreign : null;
}

/** Every price in one OCR pass, each with the box it was read from. */
export function pricesInLines(lines: OcrLine[], homeCurrency = 'USD'): DetectedPrice[] {
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
    // Whole line first, so split-cent, sale and "with card" tags read as one price.
    const singleWord = line.words.length === 1 && line.words[0]!.text === line.text.trim();
    const whole = singleWord ? null : parseTag(line.text, homeCurrency);
    if (whole) {
      add(line, whole);
      continue;
    }
    for (const w of line.words) {
      const parsed = parseTag(w.text, homeCurrency);
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
 * Turn plugin blocks into OCR lines in image space, keeping only text with a digit —
 * the same filter the frame processor applies before handing lines to the JS thread.
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
      if (!/\d/.test(lineText)) continue;
      const words = (line.elements ?? [])
        .filter((el) => /\d/.test(el.elementText ?? ''))
        .map((el) => box(el.elementFrame, el.elementText ?? ''));
      lines.push({ ...box(line.lineFrame, lineText), words });
    }
  }
  return lines;
}
