/**
 * delete-account — Supabase Edge Function (FR-12). See handler.ts.
 *
 * Deploy: supabase functions deploy delete-account
 * SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set by Supabase for every function.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { handleDeleteAccount } from './handler.ts';

const admin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

Deno.serve((req) =>
  handleDeleteAccount(req, {
    async userIdForToken(token) {
      const { data, error } = await admin.auth.getUser(token);
      return error ? null : (data.user?.id ?? null);
    },
    async deleteUser(userId) {
      const { error } = await admin.auth.admin.deleteUser(userId);
      if (error) throw error;
    },
  }),
);
