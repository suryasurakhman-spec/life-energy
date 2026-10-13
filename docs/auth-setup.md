# Sign-in setup (FR-13)

The app signs in with Supabase Auth: an emailed one-time link, native Google (Android and iOS) and native Sign in with Apple (iOS only). The code is done; each provider needs accounts and keys that only the project owner can create. Do the steps in order; each section ends with what to put in `.env`.

After changing `.env`, restart Metro (`yarn start`) so the new values are bundled. Google and Apple settings that change `app.config.js` (the iOS client ID) also need a new native build.

## 1. Supabase project (needed for every method)

1. Create a project at [supabase.com](https://supabase.com) (free tier is fine).
2. **Project Settings → API**: copy the **Project URL** and the **anon public** key into `.env`:
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon key>
   ```
   The anon key is meant to ship in the app. Never put the **service_role** key in `.env` or the app.
3. **Authentication → URL Configuration → Redirect URLs**: add `beapp://auth/callback`.
4. **Authentication → Sign In / Providers → Email**: leave enabled.

Email sign-in now works. Supabase's built-in mailer sends only a few emails per hour; before launch, set up a real SMTP provider under **Authentication → Emails → SMTP Settings** (e.g. Resend, Postmark, Amazon SES).

## 2. Google

### In Google Cloud Console ([console.cloud.google.com](https://console.cloud.google.com))

1. Create (or pick) a project.
2. **APIs & Services → OAuth consent screen**: choose **External**, fill in app name, support email and developer email. Scopes: the defaults (`email`, `profile`, `openid`) are enough. While the app is in testing, add your own Google account under **Test users**.
3. **APIs & Services → Credentials → Create credentials → OAuth client ID**, three times:

   | Type | Settings | Used for |
   | --- | --- | --- |
   | **Web application** | No origins or redirect URIs needed | Supabase verifies tokens against it; the app passes it as `webClientId` |
   | **Android** | Package name `com.beapp.beapp`; SHA-1 below | Lets the Android account picker issue tokens for this app |
   | **iOS** | Bundle ID `com.beapp.beapp` | The iOS Google sheet |

   **Android SHA-1 fingerprints.** Google only accepts sign-in from builds signed with a listed key. Create one Android client per key:
   - Development build (`android/app/debug.keystore`):
     `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`
   - Release build: run `eas credentials` (Android → production) to see the upload key SHA-1, and, once the app is on Google Play, also add the **App signing key** SHA-1 from Play Console → Setup → App integrity. Sign-in fails in store builds until these are added.
4. Open the **Web application** client and copy its **Client ID** and **Client secret**.

### In Supabase

**Authentication → Sign In / Providers → Google**:
- Enable it.
- **Client ID**: the Web client ID. **Client secret**: the Web client secret.
- **Authorized Client IDs**: add the Android client ID(s) and the iOS client ID, comma-separated.
- **Skip nonce checks**: turn on. The iOS Google SDK adds a nonce the app can't read, and Supabase would otherwise reject its tokens.

### `.env`

```
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=<web client id>.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=<ios client id>.apps.googleusercontent.com
```

The "Continue with Google" button appears once the web client ID is set (and, on iOS, the iOS client ID). Setting the iOS client ID also adds its URL scheme to the iOS build through `app.config.js`, so iOS needs a new native build afterwards.

## 3. Apple (iOS only)

Apple has no native sign-in on Android, and only requires Sign in with Apple in the iOS app (App Store Guideline 4.8, because Google sign-in is offered). The button shows on iOS 13+ only.

1. Join the [Apple Developer Program](https://developer.apple.com/programs/) ($99/year).
2. **Certificates, Identifiers & Profiles → Identifiers**: open (or create) the App ID `com.beapp.beapp` and tick **Sign In with Apple**. EAS Build can do this for you; `app.json` already sets `ios.usesAppleSignIn`.
3. In Supabase, **Authentication → Sign In / Providers → Apple**: enable it and add `com.beapp.beapp` under **Client IDs**. Native sign-in only needs the bundle ID; the Services ID and secret key fields are for web sign-in and can stay empty.

Nothing goes in `.env` for Apple. Test on a real iPhone or a simulator signed into an Apple ID, with an iOS development build (`eas build --profile development --platform ios`).

## 4. Before launch

- [ ] Real SMTP provider for the email link.
- [ ] Google OAuth consent screen moved from **Testing** to **In production** (otherwise only test users can sign in).
- [ ] Release and Play App Signing SHA-1s added as Android OAuth clients.
- [ ] Account deletion (FR-12): a Supabase Edge Function that deletes the signed-in user, called from Profile → Delete all data. Not built yet.
