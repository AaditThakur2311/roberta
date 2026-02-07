import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if keys are available, otherwise return a null-safe mock or throw
// For development without keys, we'll allow the app to run in offline-only mode
const isConfigured = supabaseUrl && supabaseAnonKey;

export const supabase = isConfigured
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

export const isBackendConfigured = () => !!supabase;
