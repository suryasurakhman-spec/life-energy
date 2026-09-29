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
