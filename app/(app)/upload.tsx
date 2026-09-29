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
