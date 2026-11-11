import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../services/supabase'

const AuthContext = createContext()

const ensureUserProfile = async (user) => {
  if (!user) return
  try {
    const fullName =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split('@')[0] ||
      ''
    await supabase
      .from('profiles')
      .upsert(
        {
          id: user.id,
          full_name: fullName,
          email: user.email || '',
        },
        { onConflict: 'id', ignoreDuplicates: true }
      )
  } catch (err) {
    console.warn('Profile sync skipped:', err)
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const nextUser = session?.user ?? null
      setUser(nextUser)
      if (event === 'SIGNED_IN' && nextUser?.app_metadata?.provider === 'google') {
        ensureUserProfile(nextUser)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
