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
