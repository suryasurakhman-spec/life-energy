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
        await supabase.auth.exchangeCodeForSession(result.url)
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
