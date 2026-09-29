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
