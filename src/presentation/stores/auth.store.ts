import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';
import { onAuthStateChange } from '@/infrastructure/supabase/supabase-auth';

interface AuthState {
  session: Session | null;
  user: User | null;
  isSignedIn: boolean;
  isLoading: boolean;
  setSession: (session: Session | null) => void;
  initialize: () => () => void; // returns unsubscribe
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  isSignedIn: false,
  isLoading: true,

  setSession: (session) => set({
    session,
    user: session?.user ?? null,
    isSignedIn: session !== null,
    isLoading: false,
  }),

  initialize: () => {
    const { unsubscribe } = onAuthStateChange((session) => {
      set({
        session,
        user: session?.user ?? null,
        isSignedIn: session !== null,
        isLoading: false,
      });
    });
    return unsubscribe;
  },
}));
