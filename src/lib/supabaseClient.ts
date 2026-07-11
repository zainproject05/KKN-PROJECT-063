/// <reference types="vite/client" />
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

function isValidSupabaseUrl(url?: string) {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch (e) {
    return false;
  }
}

if (!isValidSupabaseUrl(supabaseUrl)) {
  console.error("Invalid or missing VITE_SUPABASE_URL:\n" + supabaseUrl);
}

if (!supabaseAnonKey) {
  console.error("Missing VITE_SUPABASE_ANON_KEY");
}

export const isSupabaseConfigured =
  isValidSupabaseUrl(supabaseUrl) && !!supabaseAnonKey;

export const supabase: any = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: "kkn-project-auth"
      }
    })
  : null;
