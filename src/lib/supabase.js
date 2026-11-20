import { createClient } from '@supabase/supabase-js';

// Configured via .env (see .env.example). Without it the app runs entirely on
// demo data. With it, the "Try the demo" button still switches to demo data at
// runtime (handy for in-person demos on bad Wi-Fi).
const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

// The session is kept in localStorage so users stay signed in across reloads
// and app restarts until they log out.
export const supabase = url && key
  ? createClient(url, key, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, storageKey: 'driveflow-auth' },
    })
  : null;

export const hasBackend = !!supabase;
