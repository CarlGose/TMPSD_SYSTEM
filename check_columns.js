import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qdbvxfxldbaqcfakrihu.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkYnZ4ZnhsZGJhcWNmYWtyaWh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMzMjI1MzIsImV4cCI6MjA5ODg5ODUzMn0.6YLoih36qFbn9YzlU86mQmyPvlK3WRgmsA2PHdfzBII'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function getColumns() {
  const { data, error } = await supabase
    .from('drivers')
    .select('*')
    .limit(1)
  
  if (error) {
    console.error("Error fetching:", error)
  } else {
    console.log("Success! Columns found in data:")
    if (data && data.length > 0) {
      console.log(Object.keys(data[0]))
    } else {
      console.log("No rows, trying to insert an empty row to see error...")
      const { error: insertError } = await supabase.from('drivers').insert([{}]).select()
      console.log("Insert error details:", insertError)
    }
  }
}

getColumns()
