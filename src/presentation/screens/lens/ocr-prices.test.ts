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

describe('parseTag OCR noise', () => {
  it('reads an S or s before a full amount as a dollar sign', () => {
    expect(parseTag('S22,90')).toMatchObject({ minor: 2290n, currency: 'USD', confidence: 1 });
    expect(parseTag('s99.90')).toMatchObject({ minor: 9990n, currency: 'USD' });
  });

  it('also reads an S with a space before the amount', () => {
    expect(parseTag('S 1.99')).toMatchObject({ minor: 199n, currency: 'USD' });
  });

  it('reads an amount with cents behind stray letters', () => {
    expect(parseTag('AIMS9.98')).toMatchObject({ minor: 998n, currency: 'USD' });
    expect(parseTag('IIU6.98')).toMatchObject({ minor: 698n, currency: 'USD' });
    expect(parseTag('¢2.99')).toMatchObject({ minor: 299n, currency: 'USD' });
  });

  it('does not strip a currency code into dollars', () => {
    expect(parseTag('EUR4.99')).toBeNull();
  });

  it('does not read codes behind letters without cents', () => {
    expect(parseTag('SKU1001')).toBeNull();
    expect(parseTag('REST4.000')).toBeNull();
    expect(parseTag('Oo1.09')).toBeNull();
  });

  it('leaves S-codes alone', () => {
    expect(parseTag('S412122')).toBeNull();
  });

  it('drops a Japanese trailing dash or tilde', () => {
    expect(parseTag('¥4,600-')).toMatchObject({ minor: 4600n, currency: 'JPY' });
    expect(parseTag('¥7,600~)')).toMatchObject({ minor: 7600n, currency: 'JPY' });
  });

  it('reads an F before a thousands amount as a yen sign', () => {
    expect(parseTag('F4,725~')).toMatchObject({ minor: 4725n, currency: 'JPY' });
    expect(parseTag('F7,875', 'USD')).toMatchObject({ minor: 7875n, currency: 'JPY' });
    expect(parseTag('F725')).toBeNull();
  });
});

const word = (text: string, x = 0) => ({ text, x, y: 0, width: 10, height: 10 });
const line = (text: string, words = [word(text)]) => ({ ...word(text), words });

describe('pricesInLines fuel boards', () => {
  it('reads grade prices when a grade name is in view', () => {
    const lines = [
      line('REG 349', [word('349')]),
      line('PREM 3699', [word('3699')]),
      line('2.891'),
    ];
    expect(pricesInLines(lines).map((p) => p.minor)).toEqual([349n, 369n, 289n]);
  });

  it('reads the 9/10 mark read as "%" after a fuel price', () => {
    expect(pricesInLines([line('Unleaded'), line('484%')]).map((p) => p.minor)).toEqual([484n]);
  });

  it('needs a fuel-only word or two grade names, not one product word', () => {
    expect(pricesInLines([line('PREMIUM PASTA'), line('500')])).toEqual([]);
    expect(pricesInLines([line('PREMIUM'), line('PREMIUM'), line('500')])).toEqual([]);
    expect(pricesInLines([line('Regular'), line('Plus'), line('3399')]).map((p) => p.minor)).toEqual([339n]);
  });

  it('leaves bare numbers alone without a grade name', () => {
    expect(pricesInLines([line('3399'), line('1090')])).toEqual([]);
  });
});

describe('pricesInLines', () => {
  it('reads a multi-word line as one price before trying single words', () => {
    const split = line('$3 99', [word('$3'), word('99', 12)]);
    expect(pricesInLines([split]).map((p) => p.minor)).toEqual([399n]);
  });

  it('skips savings, coupon and gift-card amounts', () => {
    const lines = [
      line('SAVE: $2.20 Ls', [word('$2.20')]),
      line('free $10 GiftCard with purchase', [word('$10')]),
      line('$3 OFF', [word('$3')]),
      line('$5.79'),
    ];
    expect(pricesInLines(lines).map((p) => p.minor)).toEqual([579n]);
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

  it('keeps a fuel grade name without digits, so the board is recognised', () => {
    const lines = ocrLinesFromBlocks([
      {
        lines: [
          { lineText: 'regular gasoline', lineFrame: { x: 50, y: 10, width: 40, height: 10 } },
          {
            lineText: '403',
            lineFrame: { x: 50, y: 30, width: 30, height: 20 },
            elements: [{ elementText: '403', elementFrame: { x: 50, y: 30, width: 30, height: 20 } }],
          },
        ],
      },
    ]);
    expect(lines.map((l) => l.text)).toEqual(['regular gasoline', '403']);
    expect(pricesInLines(lines).map((p) => p.minor)).toEqual([403n]);
  });
});
