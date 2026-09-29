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
