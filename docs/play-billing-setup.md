# Pro on Google Play: setup checklist

The app code is ready. These steps are done by you in Google Play Console and RevenueCat. Total: about 1 hour of work, plus 1–3 days for Google to verify your account.

## 1. Google Play Console (once)
1. Create a developer account at play.google.com/console. It costs $25 one-time and needs identity verification.
2. Go to **Setup → Payments profile**, add your bank account, and fill in the tax information. Google asks for the US tax form W-8BEN if you are not a US developer. Google pays out monthly once your balance passes the payout minimum.
3. Create the app "Life Energy".

## 2. A build Play can see
Play lists in-app products only after you upload a build that contains the billing library.
1. Build a signed release AAB: `eas build -p android --profile production`, or a local release build.
2. Go to **Testing → Internal testing**, upload the AAB, and add yourself as a tester.

## 3. The Pro product
1. Go to **Monetize → Products → In-app products → Create**.
   - Product ID: `pro_lifetime` (cannot be changed later).
   - Name: "Life Energy Pro". Description: "Unlock the Wall Chart, crossover projection and monthly review."
   - Price: suggested **$7.99**. Play fills in local prices (IDR, JPY, …) from it. Activate.
2. Go to **Setup → License testing** and add your Google account, so test purchases cost nothing.

## 4. RevenueCat
1. Create a free account at app.revenuecat.com, then a project, then an **Android app** with package `com.beapp.beapp`.
2. Upload a Google Cloud **service-account JSON key** with Play access. RevenueCat's "Google Play service credentials" guide shows the steps; it can take up to 36 hours to start working.
3. Go to **Product catalog → Products** and import `pro_lifetime`.
4. Go to **Entitlements**, create `pro_v2` (this exact id; the app checks it), and attach `pro_lifetime`.
5. Go to **Offerings**, make sure `default` is the current offering, and add a package (type: Lifetime) with `pro_lifetime`.
6. Go to **API keys**, copy the **public Android key** (starts with `goog_`), and put it in `.env`:
   ```
   EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=goog_xxxxxxxx
   ```
   This key is public by design (it ships inside the app). Never put the *secret* key in the app.

## 5. Test
1. Rebuild and install from the Internal testing link, on a phone signed in with the license-tester account.
2. Open the Month tab and tap Wall Chart. The paywall shows "$7.99".
3. Buy it (the test card is free). Wall Chart opens, and Profile → Plan shows "Pro".
4. Clear the app data, open the paywall, and tap **Restore purchases**. Pro comes back.

## 6. Before release
- In Play Console's **Data safety** form, declare "Purchase history" (collected, not shared, used for app functionality).
- Fill in the privacy policy placeholders ([Operator name], [contact email], [postal address]) in `site/privacy.html`.
