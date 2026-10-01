import { create } from 'zustand';
import type { DetectedPrice } from '@/domain/price/stabilizer';

type LensMode = 'live' | 'freeze';

interface LensState {
  mode: LensMode;
  torchOn: boolean;
  selectedChipId: string | null;
  stablePrices: DetectedPrice[];

  freeze: () => void;
  unfreeze: () => void;
  toggleTorch: () => void;
  selectChip: (id: string | null) => void;
  setPrices: (prices: DetectedPrice[]) => void;
}

export const useLensStore = create<LensState>((set) => ({
  mode: 'live',
  torchOn: false,
  selectedChipId: null,
  stablePrices: [],

  freeze:      () => set({ mode: 'freeze' }),
  unfreeze:    () => set({ mode: 'live', selectedChipId: null }),
  toggleTorch: () => set((s) => ({ torchOn: !s.torchOn })),
  selectChip:  (id) => set({ selectedChipId: id }),
  setPrices:   (stablePrices) => set({ stablePrices }),
}));
