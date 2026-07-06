import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qdbvxfxldbaqcfakrihu.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkYnZ4ZnhsZGJhcWNmYWtyaWh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMzMjI1MzIsImV4cCI6MjA5ODg5ODUzMn0.6YLoih36qFbn9YzlU86mQmyPvlK3WRgmsA2PHdfzBII'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
