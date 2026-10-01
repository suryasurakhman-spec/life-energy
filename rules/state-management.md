# State Management Rules

## Stack

- **Zustand** — all client-side UI state (not server/async data).
- **TanStack Query** — all async / server state (see `data-fetching.md`).

The rule: if the state comes from the network or database, it belongs in TanStack Query. If it's purely UI state (sheet open, active tab, lens mode, onboarding step), it belongs in Zustand.

---

## When to Use Zustand vs TanStack Query

| State type | Tool |
|------------|------|
| Expense list from SQLite | TanStack Query |
| Current real wage from DB | TanStack Query |
| RevenueCat customer info | TanStack Query |
| Is the label sheet open? | Zustand |
| Which price chip is selected? | Zustand |
| Lens mode (live / freeze) | Zustand |
| Onboarding step | Zustand |
| Torch on/off | Zustand |
| Draft wage wizard inputs | Zustand |
| Auth session (user id, token) | Zustand (persisted) |

---

## Store Structure

One store per domain concern. Keep stores small and focused.

```
src/presentation/stores/
  lens.store.ts          // camera/lens UI state
  onboarding.store.ts    // wizard steps and draft inputs
  auth.store.ts          // session: userId, isSignedIn (persisted)
  ui.store.ts            // global UI: active sheet, toasts
```

---

## Store Pattern

Use the **slice pattern** with a typed interface. Export a single hook per store.

```ts
// src/presentation/stores/lens.store.ts
import { create } from 'zustand';

type LensMode = 'live' | 'freeze';

interface LensState {
  mode: LensMode;
  torchOn: boolean;
  selectedChipId: string | null;

  setMode: (mode: LensMode) => void;
  toggleTorch: () => void;
  selectChip: (id: string | null) => void;
  freeze: () => void;
  unfreeze: () => void;
}

export const useLensStore = create<LensState>((set) => ({
  mode: 'live',
  torchOn: false,
  selectedChipId: null,

  setMode: (mode) => set({ mode }),
  toggleTorch: () => set((s) => ({ torchOn: !s.torchOn })),
  selectChip: (id) => set({ selectedChipId: id }),
  freeze: () => set({ mode: 'freeze' }),
  unfreeze: () => set({ mode: 'live', selectedChipId: null }),
}));
```

---

## Persisted Store (Auth)

Use `zustand/middleware` `persist` with `expo-secure-store` for sensitive state.

```ts
// src/presentation/stores/auth.store.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';

const secureStorage = {
  getItem:    (key: string) => SecureStore.getItemAsync(key),
  setItem:    (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

interface AuthState {
  userId: string | null;
  isSignedIn: boolean;
  setSession: (userId: string) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      userId: null,
      isSignedIn: false,
      setSession: (userId) => set({ userId, isSignedIn: true }),
      clearSession: () => set({ userId: null, isSignedIn: false }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => secureStorage),
    }
  )
);
```

---

## Selecting State

Always select only the slice you need. Never subscribe to the whole store object.

```ts
// Good
const torchOn = useLensStore(s => s.torchOn);
const toggleTorch = useLensStore(s => s.toggleTorch);

// Bad — re-renders on any store change
const store = useLensStore();
```

For computed values derived from multiple slices, use `useShallow` or derive outside the component:

```ts
import { useShallow } from 'zustand/react/shallow';

const { mode, torchOn } = useLensStore(useShallow(s => ({ mode: s.mode, torchOn: s.torchOn })));
```

---

## Lens Store and Worklets

The Zustand lens store is for JS-thread state only. Frame processor state (detected prices, bounding boxes) lives in Reanimated shared values on the worklet thread and is passed to JS via throttled callbacks:

```ts
// In frame processor worklet — NOT Zustand
const detectedPrices = useSharedValue<DetectedPrice[]>([]);

// Throttled JS callback updates Zustand
const onPricesDetected = useCallback(
  Worklets.createRunOnJS((prices: DetectedPrice[]) => {
    useLensStore.getState().setPrices(prices);
  }),
  []
);
```

---

## Rules Summary

- No business logic in stores — stores hold state and simple setters only.
- No async operations in stores — mutations go through TanStack Query.
- One store per concern; don't create a single global store.
- Export one typed hook per store (`useLensStore`, `useAuthStore`, etc.).
- Select minimal slices; avoid subscribing to the whole store object.
- Persist only what's necessary (auth session); most UI state should reset on restart.
- Worklet-thread state (frame processor) uses Reanimated shared values, not Zustand.
