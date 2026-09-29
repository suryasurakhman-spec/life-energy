import { Slot } from 'expo-router'
import { ActivityIndicator, View } from 'react-native'
import { SessionProvider } from '@/providers/SessionProvider'
import { useSession } from '@/hooks/useSession'

function RootLayoutInner() {
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

export default function RootLayout() {
  return (
    <SessionProvider>
      <RootLayoutInner />
    </SessionProvider>
  )
}
