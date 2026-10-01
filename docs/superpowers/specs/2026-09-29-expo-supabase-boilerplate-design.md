# Expo + Supabase React Native Boilerplate

**Date:** 2026-09-29
**Project:** beapp
**Status:** Approved

---

## Overview

A clean React Native boilerplate using Expo (SDK 52, Expo Router v4) and Supabase (auth, database, storage). TypeScript strict mode throughout (`tsconfig.json` with `"strict": true`). Targets iOS and Android only.

---

## External Setup Prerequisites

Before running the app, the following must be configured outside this codebase:

1. **Supabase project** — create at supabase.com; copy URL and anon key into `.env`
2. **Google OAuth** — create OAuth credentials in Google Cloud Console; add `beapp://` as an authorized redirect URI; enable Google provider in Supabase Auth settings
3. **Apple Sign In** — requires a paid Apple Developer account; enable Sign In with Apple capability for the app bundle ID; configure in Supabase Auth settings
4. **Supabase `avatars` bucket** — create a public bucket named `avatars` in Supabase Storage; apply the RLS policies documented in the Storage section below
5. **`profiles` table** — run the SQL in the Database section below in the Supabase SQL editor

---

## Folder Structure

```
beapp/
├── app/
│   ├── _layout.tsx          # Root layout — session gate (redirects auth/app)
│   ├── +not-found.tsx
│   ├── (auth)/              # Unauthenticated screens
│   │   ├── _layout.tsx
│   │   ├── sign-in.tsx      # Email/pass + Google + Apple OAuth
│   │   └── sign-up.tsx      # Email/pass registration
│   └── (app)/               # Protected screens (require session)
│       ├── _layout.tsx      # Tab navigator
│       ├── index.tsx        # Home screen (sample DB query via useProfile)
│       ├── profile.tsx      # User profile + sign out
│       └── upload.tsx       # Storage upload demo (avatar picker)
├── lib/
│   ├── supabase.ts          # Supabase client singleton (SecureStore adapter)
│   └── storage.ts           # uploadAvatar / getAvatarUrl helpers
├── hooks/
│   ├── useSession.ts        # Subscribes to onAuthStateChange, exposes session
│   └── useProfile.ts        # Fetches/updates profiles row for current user
├── components/              # Shared UI primitives (placeholder)
├── types/
│   └── database.types.ts    # Manually typed profiles table; replace with supabase gen types
└── .env                     # EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY
```

---

## Auth Flow

### Session gate
The root `app/_layout.tsx` uses `useSession` to read the current Supabase session. While the session is initializing (async SecureStore read on startup), it renders a loading spinner to prevent a redirect loop or a flash of the wrong screen. Once the session state is known, it renders an `<Expo Router Redirect>` to `/(auth)/sign-in` when no session exists, or to `/(app)` when authenticated. No protected screen is reachable without a valid session.

### Deep-link scheme
`app.json` must declare the app scheme for OAuth redirects:
```json
{ "expo": { "scheme": "beapp" } }
```
This enables `beapp://` as the redirect URI for Google and Apple OAuth callbacks.

### Apple Sign In prerequisites
Apple Sign In requires a **paid Apple Developer account** with the Sign In with Apple capability enabled for the app's bundle ID. `expo-apple-authentication` is iOS-only and will not render on Android; the Apple button must be conditionally shown using `Platform.OS === 'ios'`.

### Sign-in (`app/(auth)/sign-in.tsx`)
Three authentication paths:
1. **Email + password** — `supabase.auth.signInWithPassword({ email, password })`
2. **Google OAuth** — `expo-auth-session` + `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: 'beapp://' } })`. After the browser redirects back, Supabase automatically detects the token in the deep-link URL and fires `onAuthStateChange`, which `useSession` already listens to — no additional `getSession()` call is needed.
3. **Apple OAuth** — `expo-apple-authentication` for the native Apple button on iOS + `supabase.auth.signInWithIdToken({ provider: 'apple', token: credential.identityToken })`. Apple returns an identity token directly, so no browser redirect is required.

### Sign-up (`app/(auth)/sign-up.tsx`)
Email + password only. OAuth users are auto-registered on first OAuth sign-in by Supabase.

### Session persistence
The Supabase client (`lib/supabase.ts`) uses `expo-secure-store` as its storage adapter so tokens are stored encrypted and survive app restarts. The client is initialized as:
```ts
import * as SecureStore from 'expo-secure-store'
import { createClient } from '@supabase/supabase-js'

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
}

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { storage: ExpoSecureStoreAdapter, autoRefreshToken: true, persistSession: true, detectSessionInUrl: false } }
)
```

### Sign-out
Available from the profile screen. Calls `supabase.auth.signOut()`, which fires `onAuthStateChange` → `useSession` updates → root layout redirects to `/(auth)`.

---

## Database

A sample `profiles` table demonstrates the RLS pattern:

```sql
create table profiles (
  id uuid references auth.users primary key,
  username text,
  avatar_url text,
  created_at timestamptz default now()
);

alter table profiles enable row level security;
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);

-- Auto-create profile row on new user sign-up
-- `security definer` runs the function as the function owner (postgres role),
-- which bypasses RLS and has INSERT permission on profiles by default in Supabase.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

`useProfile` hook fetches the current user's profile on mount and exposes an `updateProfile` function. It subscribes to `useSession` — when the session becomes `null` (sign-out), the hook clears the cached profile immediately to prevent stale data from being displayed.

**Error handling:** Auth and DB calls use try/catch blocks. Errors are surfaced as `error` state returned from each hook, so screens can show inline error messages without crashing.

**Types:** `database.types.ts` is manually typed for the `profiles` table as a starting point:
```ts
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: { id: string; username: string | null; avatar_url: string | null; created_at: string }
        Insert: { id: string; username?: string | null; avatar_url?: string | null }
        Update: { username?: string | null; avatar_url?: string | null }
      }
    }
  }
}
```
Replace with the full generated output once you have a Supabase project:
```bash
npx supabase gen types typescript --project-id <your-project-id> > types/database.types.ts
```

---

## Storage

Assumes an `avatars` bucket (public) exists in the Supabase project with the following storage policy:
```sql
-- Allow authenticated users to upload/update their own avatar
-- storage.foldername(name) returns the folder segments of the path; [1] is the first segment.
-- For the path `<userId>/avatar.jpg`, segment [1] is `<userId>`, matching auth.uid().
create policy "Users can upload own avatar"
  on storage.objects for insert with check (
    bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]
  );
create policy "Users can update own avatar"
  on storage.objects for update using (
    bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]
  );
create policy "Public avatars are viewable by everyone"
  on storage.objects for select using (bucket_id = 'avatars');
```

`lib/storage.ts` exposes:
- `uploadAvatar(userId: string, imageUri: string): Promise<string>` — uploads to `avatars/<userId>/avatar.jpg`, returns the public URL. Always overwrites the previous file at that path (intentional: one avatar per user, no versioning needed for a boilerplate). `expo-image-picker` is configured with `mediaTypes: 'Images'` and `quality: 0.8` so it returns a JPEG-compatible URI; the filename is always stored as `.jpg`.
- `getAvatarUrl(userId: string): string` — returns the predictable CDN public URL (`<SUPABASE_URL>/storage/v1/object/public/avatars/<userId>/avatar.jpg`) without a network call

`app/(app)/upload.tsx` uses `expo-image-picker` to select a photo, calls `uploadAvatar`, then updates `profiles.avatar_url` via `useProfile`. Upload errors are caught and displayed inline.

---

## Dependencies

| Package | Purpose |
|---|---|
| `expo` | SDK 52 base |
| `expo-router` | File-based navigation |
| `@supabase/supabase-js` | Supabase client |
| `expo-secure-store` | Encrypted token storage adapter |
| `expo-auth-session` | OAuth redirect handling |
| `expo-web-browser` | Opens OAuth provider in browser |
| `expo-apple-authentication` | Native Apple Sign In button |
| `expo-image-picker` | Photo selection for storage demo |
| `@react-native-async-storage/async-storage` | Required peer dep for Supabase client |

---

## Environment Variables

```
EXPO_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
```

Prefixed with `EXPO_PUBLIC_` so they are inlined by Expo's Metro bundler and accessible via `process.env`.

---

## Out of Scope

- Push notifications
- Web platform support
- Testing setup
- CI/CD
- Custom UI component library
