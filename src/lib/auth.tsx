import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

const ALLOWED_EMAILS = (import.meta.env.VITE_ALLOWED_EMAILS ?? '')
  .split(',')
  .map((e: string) => e.trim())
  .filter(Boolean)

interface AuthContextValue {
  session: Session | null
  user: User | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  rejected: boolean
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function isAllowed(email: string | undefined): boolean {
  return !!email && ALLOWED_EMAILS.includes(email)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [rejected, setRejected] = useState(false)

  useEffect(() => {
    // supabase-js (detectSessionInUrl) auto-parses the OAuth hash fragment
    // on init, then fires onAuthStateChange. We just react to it here.
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      applySession(s)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, s) => {
      if (event === 'SIGNED_OUT') {
        setSession(null)
        return
      }
      applySession(s)
    })

    function applySession(s: Session | null) {
      if (!s) return
      if (isAllowed(s.user.email)) {
        setRejected(false)
        setSession(s)
        // clean OAuth hash/query from URL
        if (window.location.hash || window.location.search) {
          window.history.replaceState({}, '', window.location.pathname)
        }
      } else {
        setRejected(true)
        setSession(null)
        supabase.auth.signOut()
      }
    }

    return () => subscription.unsubscribe()
  }, [])

  async function signInWithGoogle() {
    setRejected(false)
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    })
  }

  async function signOut() {
    await supabase.auth.signOut()
    setSession(null)
    setRejected(false)
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        loading,
        signInWithGoogle,
        signOut,
        rejected,
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
