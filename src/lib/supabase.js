import { createClient } from '@supabase/supabase-js'

// Use env vars if available, otherwise fall back to hardcoded values
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://sugfcqqyzbhgalcvxxlr.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1Z2ZjcXF5emJoZ2FsY3Z4eGxyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwOTc0MDQsImV4cCI6MjA5OTY3MzQwNH0.yoRkWxqCMhqT7iHOovlwVanAoaYTlCluFEec_kHElhY'
const supabaseSchema = import.meta.env.VITE_SUPABASE_SCHEMA || 'public'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  db: {
    schema: supabaseSchema
  }
})
