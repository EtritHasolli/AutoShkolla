import { createClient } from '@supabase/supabase-js';

// Configured via .env (see .env.example). When the env vars are missing the
// app runs in offline demo mode with the bundled seed data instead.
const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Persist the auth session in localStorage so users stay signed in across
// reloads and browser restarts (until they explicitly log out or the refresh
// token expires). These are the SDK defaults, set explicitly for clarity.
export const supabase = url && key
  ? createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'driveflow-auth',
      },
    })
  : null;
export const isLive = !!supabase;
