// src/theme/colors.ts
export const palette = {
  // Warm neutrals
  sand50:  '#FAF8F5',
  sand100: '#F3EFE9',
  sand200: '#E6DFD5',
  sand300: '#CFC5B8',
  sand500: '#8C8174',
  sand700: '#4A433B',
  sand800: '#2B2622',
  sand900: '#1A1714',
  sand950: '#110F0D',

  // Accent — amber ("life energy")
  amber100: '#FDEFD3',
  amber300: '#F7C873',
  amber500: '#E8A13A',
  amber600: '#C9821F',
  amber700: '#9A6214',

  // Support
  sage500:  '#5E8C6A',   // positive: "worth it", crossover progress
  slate500: '#5B6B7F',   // info
  error500: '#C2412D',   // errors ONLY (misread, failed sync) — never prices
} as const;

export interface ColorTokens {
  bg:            string;
  surface:       string;
  surfaceAlt:    string;
  border:        string;
  textPrimary:   string;
  textSecondary: string;
  accent:        string;
  accentSoft:    string;
  onAccent:      string;
  positive:      string;
  error:         string;
}

export const light: ColorTokens = {
  bg:            palette.sand50,
  surface:       '#FFFFFF',
  surfaceAlt:    palette.sand100,
  border:        palette.sand200,
  textPrimary:   palette.sand900,
  textSecondary: palette.sand500,
  accent:        palette.amber600,
  accentSoft:    palette.amber100,
  onAccent:      '#FFFFFF',
  positive:      palette.sage500,
  error:         palette.error500,
};

export const dark: ColorTokens = {
  bg:            palette.sand950,
  surface:       palette.sand900,
  surfaceAlt:    palette.sand800,
  border:        palette.sand700,
  textPrimary:   palette.sand50,
  textSecondary: palette.sand300,
  accent:        palette.amber500,
  accentSoft:    '#3A2A12',
  onAccent:      palette.sand950,
  positive:      '#7FB08B',
  error:         '#E06A55',
};
