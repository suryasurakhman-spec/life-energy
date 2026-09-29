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
