import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

const SHARED_EMAIL = import.meta.env.VITE_SUPABASE_SHARED_EMAIL as string
const SHARED_PASSWORD = import.meta.env.VITE_SUPABASE_SHARED_PASSWORD as string
const APP_PIN = import.meta.env.VITE_APP_PIN as string

interface AuthContextValue {
  session: Session | null
  user: User | null
  loading: boolean
  signInWithPin: (pin: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, s) => {
      if (event === 'SIGNED_OUT') {
        setSession(null)
        return
      }
      setSession(s)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function signInWithPin(pin: string): Promise<{ error: string | null }> {
    if (pin !== APP_PIN) {
      return { error: 'PIN salah. Coba lagi.' }
    }
    const { error } = await supabase.auth.signInWithPassword({
      email: SHARED_EMAIL,
      password: SHARED_PASSWORD,
    })
    if (error) return { error: 'Gagal masuk. Hubungi admin.' }
    return { error: null }
  }

  async function signOut() {
    await supabase.auth.signOut()
    setSession(null)
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        loading,
        signInWithPin,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
