import { Heart } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { Button } from '@/components/ui/button'

export function LoginPage() {
  const { signInWithGoogle, rejected } = useAuth()

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
            Masuk untuk mengelola persiapan pernikahan
          </p>
        </div>

        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          {rejected && (
            <div className="mb-4 rounded-md bg-destructive/10 px-3 py-2 text-center text-sm text-destructive">
              Akses ditolak. Akun Gmail kamu tidak terdaftar.
            </div>
          )}

          <Button
            className="w-full gap-3"
            variant="outline"
            size="lg"
            onClick={() => signInWithGoogle()}
          >
            <svg className="size-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Masuk dengan Google
          </Button>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Hanya akun yang terdaftar yang bisa mengakses
        </p>
      </div>
    </div>
  )
}
