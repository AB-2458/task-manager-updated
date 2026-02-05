/**
 * Supabase Client Configuration
 * 
 * Creates a Supabase admin client using the service role key.
 * This client bypasses RLS - use only on the server side.
 */

import { createClient } from '@supabase/supabase-js';
import config from '../config/index.js';

/**
 * Supabase Admin Client
 * 
 * Uses the service role key which bypasses Row Level Security.
 * IMPORTANT: Never expose this client or key to the frontend.
 */
export const supabaseAdmin = createClient(
  config.supabase.url,
  config.supabase.serviceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

/**
 * Create a Supabase client for a specific user
 * 
 * This creates a client that respects RLS by using the user's JWT.
 * Use this for operations that should be scoped to the current user.
 * 
 * @param {string} accessToken - The user's JWT access token
 * @returns {SupabaseClient} Supabase client scoped to the user
 */
export function createUserClient(accessToken) {
  return createClient(
    config.supabase.url,
    config.supabase.serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    }
  );
}

export default supabaseAdmin;
