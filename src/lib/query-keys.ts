export const keys = {
  expenses: {
    all:    () => ['expenses'] as const,
    list:   (month: string) => ['expenses', 'list', month] as const,
    detail: (id: string)    => ['expenses', 'detail', id] as const,
  },
  wage: {
    current: () => ['wage', 'current'] as const,
    history: () => ['wage', 'history'] as const,
  },
  conversions: {
    recent: () => ['conversions', 'recent'] as const,
  },
  fxRates: {
    base: (currency: string) => ['fx-rates', currency] as const,
  },
} as const;
