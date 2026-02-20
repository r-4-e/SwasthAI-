import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables on server.');
}

// Only create client if URL is valid
export const supabase = (supabaseUrl && supabaseUrl !== "YOUR_SUPABASE_URL")
  ? createClient(supabaseUrl, supabaseAnonKey!)
  : {
      auth: {
        getUser: async () => ({ data: { user: null }, error: new Error('Supabase not configured') }),
      }
    } as any;
