import { createClient } from '@supabase/supabase-js'

// Use env vars if available, otherwise fall back to hardcoded values
const rawUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '')
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabaseSchema = import.meta.env.VITE_SUPABASE_SCHEMA || 'public'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  db: {
    schema: supabaseSchema
  }
})
