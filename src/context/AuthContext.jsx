import { createContext, useContext, useState, useEffect, useRef } from 'react'
import { supabase } from '../services/supabase'

const AuthContext = createContext()

const getDerivedName = (user) =>
  user?.user_metadata?.full_name ||
  user?.user_metadata?.name ||
  user?.email?.split('@')[0] ||
  ''

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const syncedUsersRef = useRef(new Set())

  useEffect(() => {
    const syncProfile = async (sessionUser) => {
      if (!sessionUser?.id) return
      const fullName = getDerivedName(sessionUser)
      const syncKey = `${sessionUser.id}:${sessionUser.email || ''}:${fullName}`
      if (syncedUsersRef.current.has(syncKey)) return

      try {
        const { error } = await supabase
          .from('profiles')
          .upsert(
            {
              id: sessionUser.id,
              full_name: fullName,
              email: sessionUser.email || '',
            },
            { onConflict: 'id', ignoreDuplicates: true }
          )

        if (error) {
          console.warn('Profile sync failed:', error.message)
          return
        }
        syncedUsersRef.current.add(syncKey)
      } catch (err) {
        console.warn('Profile sync skipped:', err)
      }
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      setLoading(false)
      if (currentUser) {
        syncProfile(currentUser)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const nextUser = session?.user ?? null
      setUser(nextUser)
      if (nextUser && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'USER_UPDATED')) {
        syncProfile(nextUser)
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
