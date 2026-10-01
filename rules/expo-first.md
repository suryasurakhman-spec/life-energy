# Expo-First Rules

Always prefer Expo SDK packages and APIs over third-party alternatives. Expo packages are tested against the current SDK's React Native version, work in EAS builds without extra native configuration, and have consistent update cycles.

Only reach for a third-party package when Expo provides no equivalent, or when the Expo package explicitly lacks a required capability (document this in a comment).

---

## Component and API Preference Table

| Need | Use (Expo) | Do NOT use |
|------|-----------|------------|
| Navigation / routing | `expo-router` | `react-navigation` directly |
| Image display | `expo-image` | `react-native` `Image`, `react-native-fast-image` |
| Icons | `@expo/vector-icons` | `react-native-vector-icons` |
| Fonts | `expo-font` + `@expo-google-fonts/*` | manual asset linking |
| Camera | `react-native-vision-camera` (no Expo equivalent for frame processors) | `expo-camera` for the lens — Vision Camera is required for ML Kit worklets |
| Permissions | `expo-camera`, `expo-media-library`, etc. (module-scoped) | `react-native-permissions` |
| SQLite | `expo-sqlite` | `react-native-sqlite-storage`, `better-sqlite3` |
| Secure storage | `expo-secure-store` | `react-native-keychain`, `@react-native-async-storage/async-storage` for secrets |
| Async storage (non-sensitive) | `@react-native-async-storage/async-storage` | `react-native-mmkv` (unless perf profiling shows a need) |
| Localization / locale | `expo-localization` | `react-native-localize` |
| Haptics | `expo-haptics` | `react-native-haptic-feedback` |
| Linking / deep links | `expo-linking` | `react-native-deep-linking` |
| Clipboard | `expo-clipboard` | `@react-native-clipboard/clipboard` |
| Share sheet | `expo-sharing` | `react-native-share` |
| Status bar | `expo-status-bar` | `react-native` `StatusBar` |
| Safe area | `react-native-safe-area-context` (Expo SDK includes it) | custom padding hacks |
| Splash screen | `expo-splash-screen` | manual native splash |
| App icon / assets | `expo` asset pipeline in `app.json` | manual Xcode / Gradle asset management |
| In-app updates (OTA) | `expo-updates` | CodePush |
| Build / distribution | EAS Build + EAS Submit | Fastlane, manual Xcode Archive |
| Environment variables | `EXPO_PUBLIC_` prefix via `.env.local` + `expo-constants` | `react-native-config`, `babel-plugin-transform-inline-environment-variables` |
| Device info | `expo-device` | `react-native-device-info` |
| App version / constants | `expo-constants` (`Constants.expoConfig`) | manual `package.json` parsing |
| Blur view | `expo-blur` | `@react-native-community/blur` |
| Linear gradient | `expo-linear-gradient` | `react-native-linear-gradient` |
| Local authentication (Face ID) | `expo-local-authentication` | `react-native-touch-id`, `react-native-biometrics` |
| Notifications | `expo-notifications` | `react-native-push-notification` |
| File system | `expo-file-system` | `react-native-fs` |
| Document picker | `expo-document-picker` | `react-native-document-picker` |
| Barcode / QR scan | `expo-barcode-scanner` or `expo-camera` | `react-native-camera` (deprecated) |
| Web browser / OAuth | `expo-web-browser` | `react-native-inappbrowser-reborn` |
| AV / audio | `expo-av` or `expo-audio` | `react-native-sound`, `react-native-track-player` |

---

## Exceptions (justified third-party)

These packages have no Expo equivalent for the required capability:

| Package | Why third-party is required |
|---------|----------------------------|
| `react-native-vision-camera` v4 | Frame processors (worklet thread) needed for ML Kit real-time OCR. `expo-camera` has no frame processor API. |
| `@shopify/react-native-skia` | Real-time canvas drawing over the camera view. No Expo equivalent. |
| `react-native-worklets-core` | Required by Vision Camera for JS worklet threads. |
| `@gorhom/bottom-sheet` | `expo-bottom-sheet` does not exist; this is the standard. |
| `react-native-purchases` (RevenueCat) | No Expo in-app purchase package for v2+ paywall. |
| `@tanstack/react-query` | Data-fetching layer (no Expo equivalent). |
| `zustand` | State management (no Expo equivalent). |
| `drizzle-orm` | Type-safe ORM for `expo-sqlite`. |
| `victory-native` | Charts with Skia renderer (no Expo equivalent). |
| `zod` | Runtime schema validation (no Expo equivalent). |

---

## Expo Router Conventions

Use `expo-router` file-based routing exclusively. Do not use `react-navigation` `createStackNavigator` or similar directly.

```
app/
  _layout.tsx          // Root layout: providers, fonts, QueryClient
  (tabs)/
    _layout.tsx        // Tab bar
    index.tsx          // Lens (home tab)
    log.tsx            // Log tab
    profile.tsx        // Profile tab
  onboarding/
    _layout.tsx
    welcome.tsx
    wage-quick.tsx
    wage-full.tsx
    reveal.tsx
  +not-found.tsx
```

- Use `expo-router`'s `Link`, `useRouter`, `useLocalSearchParams` — not `react-navigation` hooks.
- Deep links and universal links configured via `expo-linking` + the `scheme` field in `app.json`.

---

## EAS Build

- All builds go through EAS Build. No local `xcodebuild` or `./gradlew assembleRelease`.
- Development builds use `eas build --profile development` — never Expo Go.
- Pin SDK-native package versions (Vision Camera, Skia, worklets-core, Reanimated) in a `week-1 spike` before any other native work, as noted in `CLAUDE.md`.
- Use `eas.json` profiles: `development`, `preview` (internal testing), `production`.

```json
// eas.json
{
  "cli": { "version": ">= 10.0.0" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {}
  },
  "submit": {
    "production": {}
  }
}
```

---

## expo-constants for Config

Access environment config via `expo-constants`, not `process.env` at runtime (except during build-time Metro bundling):

```ts
import Constants from 'expo-constants';

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl as string;
```

Declare extra values in `app.config.ts`:

```ts
// app.config.ts
export default {
  expo: {
    extra: {
      supabaseUrl:  process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnon: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    },
  },
};
```

---

## Rules Summary

- Expo SDK package first. Third-party only when Expo has no equivalent — document why.
- `expo-router` for all navigation; no direct `react-navigation` API calls in product code.
- All builds via EAS Build; dev builds with `developmentClient: true`.
- `expo-secure-store` for any sensitive data (tokens, session).
- `expo-sqlite` as the local database, accessed via Drizzle ORM.
- `expo-haptics`, `expo-blur`, `expo-linear-gradient`, `expo-image` — use these before reaching for community packages.
