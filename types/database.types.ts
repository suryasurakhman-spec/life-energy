// Replace this file with the output of:
//   npx supabase gen types typescript --project-id <your-project-id> > types/database.types.ts
// once you have a Supabase project configured.

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          avatar_url: string | null
          created_at: string
        }
        Insert: {
          id: string
          username?: string | null
          avatar_url?: string | null
        }
        Update: {
          username?: string | null
          avatar_url?: string | null
        }
      }
    }
  }
}
