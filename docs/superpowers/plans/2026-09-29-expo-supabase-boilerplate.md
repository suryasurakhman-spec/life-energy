# Expo + Supabase Boilerplate Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold a production-ready React Native boilerplate with Expo Router v4, Supabase auth (email/password + Google + Apple), database (profiles table), and storage (avatar upload).

**Architecture:** File-based routing via Expo Router with route groups — `(auth)` for unauthenticated screens and `(app)` for protected tab screens. Session state flows from a `useSession` hook that subscribes to Supabase's `onAuthStateChange`. The Supabase client uses `expo-secure-store` for encrypted token persistence.

**Tech Stack:** Expo SDK 52, Expo Router v4, TypeScript strict, `@supabase/supabase-js` v2, `expo-secure-store`, `expo-auth-session`, `expo-apple-authentication`, `expo-image-picker`, `expo-file-system`

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `package.json` | Modify | Expo entry point + all deps |
| `app.json` | Create | App config, scheme, plugins |
| `tsconfig.json` | Create | Strict TypeScript + path aliases |
| `.env` | Create | Supabase URL + anon key (gitignored) |
| `.env.example` | Create | Template for env vars |
| `.gitignore` | Create | Ignore node_modules, .env, build artifacts |
| `types/database.types.ts` | Create | Typed Supabase schema for profiles table |
| `lib/supabase.ts` | Create | Supabase client singleton with SecureStore adapter |
| `lib/storage.ts` | Create | uploadAvatar / getAvatarUrl helpers |
| `hooks/useSession.ts` | Create | Auth session state via onAuthStateChange |
| `hooks/useProfile.ts` | Create | Fetch/update profiles row, clears on sign-out |
| `app/_layout.tsx` | Create | Root layout: shows spinner while session loads, then renders Slot |
| `app/+not-found.tsx` | Create | 404 fallback screen |
| `app/(auth)/_layout.tsx` | Create | Auth group layout: redirects to app if session exists |
| `app/(auth)/sign-in.tsx` | Create | Email/pass + Google OAuth + Apple Sign In |
| `app/(auth)/sign-up.tsx` | Create | Email/pass registration |
| `app/(app)/_layout.tsx` | Create | Tab navigator: redirects to sign-in if no session |
| `app/(app)/index.tsx` | Create | Home screen with profile display |
| `app/(app)/profile.tsx` | Create | Profile edit + sign out |
| `app/(app)/upload.tsx` | Create | Avatar picker + storage upload demo |

---

## Task 1: Project Configuration Files

**Files:**
- Modify: `package.json`
- Create: `app.json`
- Create: `tsconfig.json`
- Create: `.env`
- Create: `.env.example`
- Create: `.gitignore`

- [ ] **Step 1: Update package.json**

Replace the contents of `package.json` with:

```json
{
  "name": "beapp",
  "version": "1.0.0",
  "main": "expo-router/entry",
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios"
  },
  "dependencies": {
    "expo": "~52.0.0",
    "expo-router": "~4.0.0",
    "react": "18.3.1",
    "react-native": "0.76.3"
  },
  "devDependencies": {
    "@babel/core": "^7.24.0",
    "typescript": "~5.3.0",
    "@types/react": "~18.3.0"
  }
}
```

- [ ] **Step 2: Install Expo dependencies**

Run from `/home/surya/Documents/beapp`:

```bash
npx expo install react-native-safe-area-context react-native-screens expo-linking expo-constants expo-status-bar @supabase/supabase-js expo-secure-store expo-auth-session expo-web-browser expo-apple-authentication expo-image-picker expo-file-system @react-native-async-storage/async-storage
```

Expected: packages added to `node_modules/`, `package.json` updated with resolved versions.

- [ ] **Step 3: Create app.json**

```json
{
  "expo": {
    "name": "beapp",
    "slug": "beapp",
    "version": "1.0.0",
    "scheme": "beapp",
    "orientation": "portrait",
    "platforms": ["ios", "android"],
    "ios": {
      "supportsTablet": false,
      "bundleIdentifier": "com.beapp.beapp",
      "usesAppleSignIn": true
    },
    "android": {
      "package": "com.beapp.beapp",
      "adaptiveIcon": {
        "backgroundColor": "#ffffff"
      }
    },
    "plugins": [
      "expo-router",
      "expo-secure-store",
      [
        "expo-image-picker",
        {
          "photosPermission": "Allow beapp to access your photos for avatar upload."
        }
      ],
      "expo-apple-authentication"
    ],
    "experiments": {
      "typedRoutes": true
    }
  }
}
```

- [ ] **Step 4: Create tsconfig.json**

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx", ".expo/types/**/*.d.ts", "expo-env.d.ts"]
}
```

- [ ] **Step 5: Create .env**

```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

- [ ] **Step 6: Create .env.example**

```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

- [ ] **Step 7: Create .gitignore**

```
node_modules/
.expo/
dist/
.env
*.jks
*.p8
*.p12
*.key
*.mobileprovision
```

- [ ] **Step 8: Commit**

```bash
git init
git add app.json tsconfig.json package.json package-lock.json .env.example .gitignore
git commit -m "chore: initialize Expo + Supabase project scaffold"
```

---

## Task 2: Supabase Client and Types

**Files:**
- Create: `lib/supabase.ts`
- Create: `types/database.types.ts`

- [ ] **Step 1: Create types/database.types.ts**

```ts
// Replace this file with the output of:
//   npx supabase gen types typescript --project-id <your-project-id> > types/database.types.ts
// once you have a Supabase project configured.

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          avatar_url: string | null
          created_at: string
        }
        Insert: {
          id: string
          username?: string | null
          avatar_url?: string | null
        }
        Update: {
          username?: string | null
          avatar_url?: string | null
        }
      }
    }
  }
}
```

- [ ] **Step 2: Create lib/supabase.ts**

```ts
import * as SecureStore from 'expo-secure-store'
import { createClient } from '@supabase/supabase-js'
import { type Database } from '@/types/database.types'

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
}

export const supabase = createClient<Database>(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      storage: ExpoSecureStoreAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
)
```

- [ ] **Step 3: Commit**

```bash
git add lib/supabase.ts types/database.types.ts
git commit -m "feat: add Supabase client with SecureStore adapter and typed schema"
```

---

## Task 3: useSession Hook

**Files:**
- Create: `hooks/useSession.ts`

- [ ] **Step 1: Create hooks/useSession.ts**

```ts
import { useEffect, useState } from 'react'
import { type Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

export function useSession() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session from SecureStore (async on startup)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  return { session, loading }
}
```

- [ ] **Step 2: Commit**

```bash
git add hooks/useSession.ts
git commit -m "feat: add useSession hook with onAuthStateChange subscription"
```

---

## Task 4: Root Layout and Not-Found Screen

**Files:**
- Create: `app/_layout.tsx`
- Create: `app/+not-found.tsx`

- [ ] **Step 1: Create app/_layout.tsx**

```tsx
import { Slot } from 'expo-router'
import { ActivityIndicator, View } from 'react-native'
import { useSession } from '@/hooks/useSession'

export default function RootLayout() {
  const { loading } = useSession()

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  return <Slot />
}
```

- [ ] **Step 2: Create app/+not-found.tsx**

```tsx
import { Link, Stack } from 'expo-router'
import { Text, View, StyleSheet } from 'react-native'

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Not Found' }} />
      <View style={styles.container}>
        <Text style={styles.title}>This screen does not exist.</Text>
        <Link href="/" style={styles.link}>
          <Text>Go to home screen</Text>
        </Link>
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold' },
  link: { marginTop: 15, paddingVertical: 15 },
})
```

- [ ] **Step 3: Commit**

```bash
git add app/_layout.tsx app/+not-found.tsx
git commit -m "feat: add root layout with session loading gate"
```

---

## Task 5: Auth Group Layout

**Files:**
- Create: `app/(auth)/_layout.tsx`

- [ ] **Step 1: Create app/(auth)/_layout.tsx**

```tsx
import { Redirect, Stack } from 'expo-router'
import { useSession } from '@/hooks/useSession'

export default function AuthLayout() {
  const { session } = useSession()

  // If already authenticated, redirect to app
  if (session) {
    return <Redirect href="/(app)" />
  }

  return (
    <Stack screenOptions={{ headerShown: false }} />
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add app/(auth)/_layout.tsx
git commit -m "feat: add auth group layout with session redirect guard"
```

---

## Task 6: Sign-In Screen

**Files:**
- Create: `app/(auth)/sign-in.tsx`

- [ ] **Step 1: Create app/(auth)/sign-in.tsx**

```tsx
import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native'
import { Link } from 'expo-router'
import * as WebBrowser from 'expo-web-browser'
import { makeRedirectUri } from 'expo-auth-session'
import * as AppleAuthentication from 'expo-apple-authentication'
import { supabase } from '@/lib/supabase'

WebBrowser.maybeCompleteAuthSession()

export default function SignInScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleEmailSignIn() {
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    setLoading(false)
  }

  async function handleGoogleSignIn() {
    setLoading(true)
    setError(null)
    try {
      const redirectTo = makeRedirectUri({ scheme: 'beapp' })
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo, skipBrowserRedirect: true },
      })
      if (error) throw error
      if (!data.url) throw new Error('No OAuth URL returned')

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo)
      if (result.type === 'success' && result.url) {
        await supabase.auth.getSessionFromUrl({ url: result.url })
        // onAuthStateChange in useSession handles the rest
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Google sign-in failed')
    }
    setLoading(false)
  }

  async function handleAppleSignIn() {
    setLoading(true)
    setError(null)
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      })
      if (!credential.identityToken) throw new Error('No identity token from Apple')
      const { error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: credential.identityToken,
      })
      if (error) throw error
    } catch (err: unknown) {
      if ((err as { code?: string }).code !== 'ERR_REQUEST_CANCELED') {
        setError(err instanceof Error ? err.message : 'Apple sign-in failed')
      }
    }
    setLoading(false)
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign In</Text>

      {error && <Text style={styles.error}>{error}</Text>}

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleEmailSignIn} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign In</Text>}
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.googleButton]} onPress={handleGoogleSignIn} disabled={loading}>
        <Text style={styles.buttonText}>Continue with Google</Text>
      </TouchableOpacity>

      {Platform.OS === 'ios' && (
        <AppleAuthentication.AppleAuthenticationButton
          buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
          buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
          cornerRadius={8}
          style={styles.appleButton}
          onPress={handleAppleSignIn}
        />
      )}

      <Link href="/(auth)/sign-up" style={styles.link}>
        <Text>Don't have an account? Sign Up</Text>
      </Link>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' },
  error: { color: 'red', marginBottom: 12, textAlign: 'center' },
  input: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 8,
    padding: 12, marginBottom: 12, fontSize: 16,
  },
  button: {
    backgroundColor: '#4F46E5', padding: 14, borderRadius: 8,
    alignItems: 'center', marginBottom: 12,
  },
  googleButton: { backgroundColor: '#DB4437' },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  appleButton: { width: '100%', height: 48, marginBottom: 12 },
  link: { alignSelf: 'center', marginTop: 8 },
})
```

- [ ] **Step 2: Commit**

```bash
git add app/(auth)/sign-in.tsx
git commit -m "feat: add sign-in screen with email/pass, Google OAuth, and Apple Sign In"
```

---

## Task 7: Sign-Up Screen

**Files:**
- Create: `app/(auth)/sign-up.tsx`

- [ ] **Step 1: Create app/(auth)/sign-up.tsx**

```tsx
import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert,
} from 'react-native'
import { Link, router } from 'expo-router'
import { supabase } from '@/lib/supabase'

export default function SignUpScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSignUp() {
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) {
      setError(error.message)
    } else {
      Alert.alert('Check your email', 'A confirmation link has been sent to your email.', [
        { text: 'OK', onPress: () => router.replace('/(auth)/sign-in') },
      ])
    }
    setLoading(false)
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>

      {error && <Text style={styles.error}>{error}</Text>}

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleSignUp} disabled={loading}>
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.buttonText}>Create Account</Text>
        }
      </TouchableOpacity>

      <Link href="/(auth)/sign-in" style={styles.link}>
        <Text>Already have an account? Sign In</Text>
      </Link>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' },
  error: { color: 'red', marginBottom: 12, textAlign: 'center' },
  input: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 8,
    padding: 12, marginBottom: 12, fontSize: 16,
  },
  button: {
    backgroundColor: '#4F46E5', padding: 14, borderRadius: 8,
    alignItems: 'center', marginBottom: 12,
  },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  link: { alignSelf: 'center', marginTop: 8 },
})
```

- [ ] **Step 2: Commit**

```bash
git add app/(auth)/sign-up.tsx
git commit -m "feat: add sign-up screen with email/password registration"
```

---

## Task 8: useProfile Hook

**Files:**
- Create: `hooks/useProfile.ts`

- [ ] **Step 1: Create hooks/useProfile.ts**

```ts
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useSession } from '@/hooks/useSession'
import { type Database } from '@/types/database.types'

type Profile = Database['public']['Tables']['profiles']['Row']
type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export function useProfile() {
  const { session } = useSession()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!session?.user.id) {
      // Clear profile immediately on sign-out to prevent stale data
      setProfile(null)
      return
    }
    fetchProfile(session.user.id)
  }, [session?.user.id])

  async function fetchProfile(userId: string) {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      if (error) throw error
      setProfile(data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load profile')
    }
    setLoading(false)
  }

  async function updateProfile(updates: ProfileUpdate) {
    if (!session?.user.id) return
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', session.user.id)
        .select()
        .single()
      if (error) throw error
      setProfile(data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update profile')
    }
    setLoading(false)
  }

  return { profile, loading, error, updateProfile }
}
```

- [ ] **Step 2: Commit**

```bash
git add hooks/useProfile.ts
git commit -m "feat: add useProfile hook with fetch, update, and sign-out cleanup"
```

---

## Task 9: Protected App Group

**Files:**
- Create: `app/(app)/_layout.tsx`
- Create: `app/(app)/index.tsx`
- Create: `app/(app)/profile.tsx`

- [ ] **Step 1: Create app/(app)/_layout.tsx**

```tsx
import { Redirect, Tabs } from 'expo-router'
import { useSession } from '@/hooks/useSession'

export default function AppLayout() {
  const { session } = useSession()

  if (!session) {
    return <Redirect href="/(auth)/sign-in" />
  }

  return (
    <Tabs screenOptions={{ headerShown: true }}>
      <Tabs.Screen
        name="index"
        options={{ title: 'Home', tabBarLabel: 'Home' }}
      />
      <Tabs.Screen
        name="upload"
        options={{ title: 'Upload', tabBarLabel: 'Upload' }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Profile', tabBarLabel: 'Profile' }}
      />
    </Tabs>
  )
}
```

- [ ] **Step 2: Create app/(app)/index.tsx**

```tsx
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native'
import { useSession } from '@/hooks/useSession'
import { useProfile } from '@/hooks/useProfile'

export default function HomeScreen() {
  const { session } = useSession()
  const { profile, loading, error } = useProfile()

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Welcome</Text>
      <Text style={styles.email}>{session?.user.email}</Text>

      {loading && <ActivityIndicator />}
      {error && <Text style={styles.error}>{error}</Text>}

      {profile && (
        <View style={styles.card}>
          <Text style={styles.label}>Username</Text>
          <Text style={styles.value}>{profile.username ?? '—'}</Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff' },
  heading: { fontSize: 28, fontWeight: 'bold', marginBottom: 4 },
  email: { color: '#666', marginBottom: 24 },
  card: {
    backgroundColor: '#f5f5f5', padding: 16, borderRadius: 12, marginBottom: 12,
  },
  label: { fontSize: 12, color: '#888', marginBottom: 4 },
  value: { fontSize: 16, fontWeight: '500' },
  error: { color: 'red' },
})
```

- [ ] **Step 3: Create app/(app)/profile.tsx**

```tsx
import { useState, useEffect } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator,
} from 'react-native'
import { useProfile } from '@/hooks/useProfile'
import { supabase } from '@/lib/supabase'

export default function ProfileScreen() {
  const { profile, loading, error, updateProfile } = useProfile()
  const [username, setUsername] = useState(profile?.username ?? '')
  const [saving, setSaving] = useState(false)

  // Sync input when profile loads asynchronously after mount
  useEffect(() => {
    setUsername(profile?.username ?? '')
  }, [profile?.username])

  async function handleSave() {
    setSaving(true)
    await updateProfile({ username })
    setSaving(false)
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
  }

  if (loading && !profile) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>

      {error && <Text style={styles.error}>{error}</Text>}

      <Text style={styles.label}>Username</Text>
      <TextInput
        style={styles.input}
        value={username}
        onChangeText={setUsername}
        placeholder="Enter username"
        autoCapitalize="none"
      />

      <TouchableOpacity style={styles.button} onPress={handleSave} disabled={saving}>
        {saving
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.buttonText}>Save</Text>
        }
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.signOutButton]} onPress={handleSignOut}>
        <Text style={styles.buttonText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 24 },
  error: { color: 'red', marginBottom: 12 },
  label: { fontSize: 14, color: '#666', marginBottom: 4 },
  input: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 8,
    padding: 12, marginBottom: 16, fontSize: 16,
  },
  button: {
    backgroundColor: '#4F46E5', padding: 14, borderRadius: 8,
    alignItems: 'center', marginBottom: 12,
  },
  signOutButton: { backgroundColor: '#DC2626' },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
})
```

- [ ] **Step 4: Commit**

```bash
git add app/(app)/_layout.tsx app/(app)/index.tsx app/(app)/profile.tsx
git commit -m "feat: add protected app group with tabs, home screen, and profile screen"
```

---

## Task 10: Storage Helpers and Upload Screen

**Files:**
- Create: `lib/storage.ts`
- Create: `app/(app)/upload.tsx`

- [ ] **Step 1: Create lib/storage.ts**

```ts
import * as ImagePicker from 'expo-image-picker'
import * as FileSystem from 'expo-file-system'
import { supabase } from '@/lib/supabase'

export async function uploadAvatar(userId: string, imageUri: string): Promise<string> {
  // Use expo-file-system for reliable cross-platform file reading (fetch() is unreliable
  // with local file:// URIs on Android from expo-image-picker).
  const base64 = await FileSystem.readAsStringAsync(imageUri, {
    encoding: FileSystem.EncodingType.Base64,
  })

  // Decode base64 to Uint8Array for Supabase storage upload
  const binaryString = atob(base64)
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }

  const filePath = `${userId}/avatar.jpg`

  const { error } = await supabase.storage
    .from('avatars')
    .upload(filePath, bytes, {
      contentType: 'image/jpeg',
      upsert: true, // overwrite if exists
    })

  if (error) throw error

  return getAvatarUrl(userId)
}

// Returns the predictable CDN URL — no network call required.
export function getAvatarUrl(userId: string): string {
  return `${process.env.EXPO_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${userId}/avatar.jpg`
}

export async function pickImage(): Promise<string | null> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
  if (status !== 'granted') {
    throw new Error('Photo library permission denied')
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  })

  if (result.canceled) return null
  return result.assets[0].uri
}
```

- [ ] **Step 2: Create app/(app)/upload.tsx**

```tsx
import { useState } from 'react'
import {
  View, Text, Image, TouchableOpacity,
  StyleSheet, ActivityIndicator,
} from 'react-native'
import { useSession } from '@/hooks/useSession'
import { useProfile } from '@/hooks/useProfile'
import { pickImage, uploadAvatar } from '@/lib/storage'

export default function UploadScreen() {
  const { session } = useSession()
  const { profile, updateProfile } = useProfile()
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handlePickAndUpload() {
    if (!session?.user.id) return
    setError(null)
    setUploading(true)
    try {
      const uri = await pickImage()
      if (!uri) return // user cancelled

      const publicUrl = await uploadAvatar(session.user.id, uri)
      await updateProfile({ avatar_url: publicUrl })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const avatarUrl = profile?.avatar_url

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Avatar</Text>

      {avatarUrl ? (
        <Image source={{ uri: avatarUrl }} style={styles.avatar} />
      ) : (
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.placeholderText}>No avatar</Text>
        </View>
      )}

      {error && <Text style={styles.error}>{error}</Text>}

      <TouchableOpacity style={styles.button} onPress={handlePickAndUpload} disabled={uploading}>
        {uploading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.buttonText}>Pick & Upload Avatar</Text>
        }
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, alignItems: 'center', backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 24 },
  avatar: { width: 120, height: 120, borderRadius: 60, marginBottom: 24 },
  avatarPlaceholder: {
    width: 120, height: 120, borderRadius: 60, backgroundColor: '#e5e7eb',
    justifyContent: 'center', alignItems: 'center', marginBottom: 24,
  },
  placeholderText: { color: '#9ca3af' },
  error: { color: 'red', marginBottom: 12 },
  button: {
    backgroundColor: '#4F46E5', padding: 14, borderRadius: 8,
    alignItems: 'center', width: '100%',
  },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
})
```

- [ ] **Step 3: Commit**

```bash
git add lib/storage.ts app/(app)/upload.tsx
git commit -m "feat: add storage helpers and avatar upload screen"
```

---

## Task 11: Supabase SQL Setup (Reference)

This task is performed in the **Supabase SQL editor**, not in code. It is included here for completeness.

- [ ] **Step 1: Run profiles table SQL**

Paste and run in the Supabase SQL editor:

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

-- `security definer` runs as the postgres role, bypassing RLS, so the trigger
-- can insert a profile row even before the user's first RLS-allowed request.
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

- [ ] **Step 2: Run avatars storage policy SQL**

Paste and run in the Supabase SQL editor:

```sql
-- storage.foldername(name) returns folder segments of the object path.
-- For `<userId>/avatar.jpg`, segment [1] is the userId.
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

- [ ] **Step 3: Update .env with real credentials**

Edit `.env`:
```
EXPO_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

---

## Task 12: Verify and Run

- [ ] **Step 1: Check TypeScript compiles cleanly**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 2: Start the app**

```bash
npx expo start
```

Expected: Metro bundler starts, QR code displayed, no build errors in terminal.

- [ ] **Step 3: Smoke test on device/simulator**

Verify manually:
- App shows loading spinner briefly, then redirects to sign-in
- Sign-up creates a user and sends confirmation email
- Email/password sign-in redirects to home tab
- Home screen shows email and loads profile
- Profile screen lets you set a username and save
- Upload screen lets you pick a photo and upload
- Sign out redirects back to sign-in

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "chore: complete boilerplate setup and verification"
```

---

## Quick Reference: External Setup Checklist

Before the app will fully work end-to-end:

| Step | Where |
|---|---|
| Create Supabase project | supabase.com |
| Copy URL + anon key to `.env` | Local |
| Run profiles table SQL (Task 11 Step 1) | Supabase SQL editor |
| Create `avatars` storage bucket (public) | Supabase Storage dashboard |
| Run storage RLS policies (Task 11 Step 2) | Supabase SQL editor |
| Create Google OAuth credentials + add `beapp://` redirect | Google Cloud Console |
| Enable Google provider in Supabase Auth | Supabase Auth settings |
| Enable Sign In with Apple in Apple Developer account | developer.apple.com |
| Enable Apple provider in Supabase Auth | Supabase Auth settings |
