import { createClient } from '@supabase/supabase-js';

const rawUrl = import.meta.env.VITE_SUPABASE_URL || '';
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Normalize URL: remove trailing slashes and common suffixes that users might accidentally include
export const supabaseUrl = rawUrl.trim().replace(/\/$/, '').replace(/\/rest\/v1$/, '').replace(/\/auth\/v1$/, '');
export const supabaseAnonKey = rawKey.trim();

// A helper check to see if the Supabase environment is properly configured
export const isSupabaseConfigured = 
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.startsWith('https://') &&
  !supabaseUrl.includes('YOUR_') && 
  !supabaseUrl.includes('placeholder') &&
  !supabaseAnonKey.includes('YOUR_') &&
  !supabaseAnonKey.includes('placeholder');

export const supabase = createClient(
  isSupabaseConfigured ? supabaseUrl : 'https://placeholder-project.supabase.co',
  isSupabaseConfigured ? supabaseAnonKey : 'placeholder-anon-key'
);
