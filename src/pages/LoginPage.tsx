import { Heart, Lock } from 'lucide-react'
import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function LoginPage() {
  const { signInWithPin, session } = useAuth()
  const navigate = useNavigate()
  const [pin, setPin] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (session) return <Navigate to="/" replace />

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!pin.trim()) return
    setLoading(true)
    setError(null)
    const result = await signInWithPin(pin)
    if (result.error) {
      setError(result.error)
    } else {
      navigate('/', { replace: true })
    }
    setLoading(false)
  }

  return (
    <div className="relative flex min-h-svh items-center justify-center overflow-hidden bg-muted/40 p-4">
      {/* decorative gradient blobs */}
      <div className="pointer-events-none absolute -left-24 -top-24 size-72 rounded-full bg-primary/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 size-72 rounded-full bg-accent blur-3xl" />

      <div className="relative w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
            <Heart className="size-7 fill-current" />
          </span>
          <h1 className="text-2xl font-semibold tracking-tight">
            Wedding Tracker
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Masukkan PIN untuk masuk
          </p>
        </div>

        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="pin-input"
                type="password"
                placeholder="Masukkan PIN"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="pl-10 text-center tracking-widest"
                autoFocus
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="rounded-md bg-destructive/10 px-3 py-2 text-center text-sm text-destructive">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? 'Memuat...' : 'Masuk'}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Hanya untuk Alfin &amp; Beby 💕
        </p>
      </div>
    </div>
  )
}
