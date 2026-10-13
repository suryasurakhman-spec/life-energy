import { describe, expect, it } from 'vitest';
import { ocrLinesFromBlocks, parseTag, pricesInLines } from './ocr-prices';

describe('parseTag home currency', () => {
  it('keeps dollar-signed prices in USD wherever the shopper lives', () => {
    expect(parseTag('$4.99', 'PLN')).toMatchObject({ minor: 499n, currency: 'USD' });
  });

  it('reads an unmarked price in the home currency', () => {
    expect(parseTag('.99', 'PLN')).toMatchObject({ minor: 99n, currency: 'PLN' });
    expect(parseTag('.99', 'USD')).toMatchObject({ minor: 99n, currency: 'USD' });
  });

  it('rescales to currencies without minor units', () => {
    expect(parseTag('.99', 'JPY')).toMatchObject({ minor: 1n, currency: 'JPY' });
  });

  it('leaves foreign-marked prices to the currency-aware parser', () => {
    expect(parseTag('€4,99', 'USD')).toMatchObject({ minor: 499n, currency: 'EUR' });
  });
});

describe('pricesInLines', () => {
  it('reads a multi-word line as one price before trying single words', () => {
    const word = (text: string, x: number) => ({ text, x, y: 0, width: 10, height: 10 });
    const line = { ...word('$3 99', 0), words: [word('$3', 0), word('99', 12)] };
    expect(pricesInLines([line]).map((p) => p.minor)).toEqual([399n]);
  });
});

describe('ocrLinesFromBlocks', () => {
  it('moves centre-point frames to top-left boxes and drops text without digits', () => {
    const lines = ocrLinesFromBlocks([
      {
        lines: [
          { lineText: 'MAYO', lineFrame: { x: 50, y: 50, width: 20, height: 10 } },
          {
            lineText: 'NOW $5.99',
            lineFrame: { x: 50, y: 20, width: 40, height: 10 },
            elements: [
              { elementText: 'NOW', elementFrame: { x: 35, y: 20, width: 10, height: 10 } },
              { elementText: '$5.99', elementFrame: { x: 60, y: 20, width: 20, height: 10 } },
            ],
          },
        ],
      },
    ]);
    expect(lines).toEqual([
      {
        text: 'NOW $5.99', x: 30, y: 15, width: 40, height: 10,
        words: [{ text: '$5.99', x: 50, y: 15, width: 20, height: 10 }],
      },
    ]);
  });
});
