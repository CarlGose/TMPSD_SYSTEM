import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

// 1 working day = 8 hours
const WORKING_DAY_MS = 8 * 60 * 60 * 1000

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
      
      // If there's an active session but no timestamp (e.g. from before this update), set it
      if (session?.user && !localStorage.getItem('admin_login_timestamp')) {
        localStorage.setItem('admin_login_timestamp', Date.now().toString())
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)

      if (event === 'SIGNED_IN') {
        localStorage.setItem('admin_login_timestamp', Date.now().toString())
      } else if (event === 'SIGNED_OUT') {
        localStorage.removeItem('admin_login_timestamp')
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Auto-logout effect checking the working day expiry
  useEffect(() => {
    const checkSessionExpiry = async () => {
      const loginTimestamp = localStorage.getItem('admin_login_timestamp')
      if (loginTimestamp) {
        const timeElapsed = Date.now() - parseInt(loginTimestamp, 10)
        if (timeElapsed > WORKING_DAY_MS) {
          // Time expired, logout the admin
          await supabase.auth.signOut()
          localStorage.removeItem('admin_login_timestamp')
        }
      }
    }

    // Check immediately on mount
    checkSessionExpiry()
    
    // Then check periodically (every 5 minutes)
    const interval = setInterval(checkSessionExpiry, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    localStorage.setItem('admin_login_timestamp', Date.now().toString())
    return data
  }

  const signUp = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    if (error) throw error
    return data
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    localStorage.removeItem('admin_login_timestamp')
  }

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
