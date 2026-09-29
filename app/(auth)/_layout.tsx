import { Redirect, Stack } from 'expo-router'
import { useSession } from '@/hooks/useSession'

export default function AuthLayout() {
  const { session } = useSession()

  // If already authenticated, redirect to app
  if (session) {
    return <Redirect href="/(app)" />
  }

  return (
    <Stack screenOptions={{ headerShown: false }} />
  )
}
