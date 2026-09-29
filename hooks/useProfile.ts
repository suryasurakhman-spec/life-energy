import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useSession } from '@/hooks/useSession'
import { type Database } from '@/types/database.types'

type Profile = Database['public']['Tables']['profiles']['Row']
type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export function useProfile() {
  const { session } = useSession()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!session?.user.id) {
      // Clear profile immediately on sign-out to prevent stale data
      setProfile(null)
      return
    }
    fetchProfile(session.user.id)
  }, [session?.user.id])

  async function fetchProfile(userId: string) {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      if (error) throw error
      setProfile(data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load profile')
    }
    setLoading(false)
  }

  async function updateProfile(updates: ProfileUpdate) {
    if (!session?.user.id) return
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', session.user.id)
        .select()
        .single()
      if (error) throw error
      setProfile(data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update profile')
    }
    setLoading(false)
  }

  return { profile, loading, error, updateProfile }
}
