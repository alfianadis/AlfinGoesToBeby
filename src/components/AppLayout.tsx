import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Wallet,
  Store,
  Tags,
  ListChecks,
  Gift,
  FileText,
  Image,
  Users,
  Clock,
  StickyNote,
  Contact,
  Heart,
  LogOut,
  Menu,
  X,
  Settings,
} from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { useConfig } from '@/hooks/useConfig'
import { Button } from '@/components/ui/button'
import {
  Avatar,
  AvatarFallback,
} from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { initials } from '@/lib/format'
import type { LucideIcon } from 'lucide-react'

interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
}

interface NavGroup {
  label: string
  items: NavItem[]
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Ringkasan',
    items: [{ to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true }],
  },
  {
    label: 'Anggaran',
    items: [
      { to: '/keuangan', label: 'Keuangan', icon: Wallet },
      { to: '/vendor', label: 'Vendor', icon: Store },
      { to: '/kategori', label: 'Kategori', icon: Tags },
    ],
  },
  {
    label: 'Persiapan',
    items: [
      { to: '/checklist', label: 'Checklist', icon: ListChecks },
      { to: '/seserahan', label: 'Seserahan', icon: Gift },
      { to: '/kua', label: 'Dokumen KUA', icon: FileText },
      { to: '/moodboard', label: 'Moodboard', icon: Image },
    ],
  },
  {
    label: 'Acara',
    items: [
      { to: '/tamu', label: 'Tamu', icon: Users },
      { to: '/rundown', label: 'Rundown', icon: Clock },
      { to: '/notes', label: 'Catatan', icon: StickyNote },
      { to: '/kontak', label: 'Kontak Penting', icon: Contact },
    ],
  },
  {
    label: 'Sistem',
    items: [
      { to: '/pengaturan', label: 'Pengaturan', icon: Settings },
    ],
  },
]

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { config } = useConfig()
  const appName = config.nama_app || 'Wedding Tracker'

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
          <Heart className="size-5 fill-current" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold leading-tight">
            {appName}
          </p>
          {config.nama_pasangan_1 && (
            <p className="truncate text-xs text-muted-foreground">
              {config.nama_pasangan_1} &amp; {config.nama_pasangan_2}
            </p>
          )}
        </div>
      </div>
      <Separator />
      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="px-3 pb-1.5 text-[0.68rem] font-semibold uppercase tracking-wider text-muted-foreground/70">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      cn(
                        'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : 'text-foreground/70 hover:bg-muted hover:text-foreground',
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon
                          className={cn(
                            'size-[18px] shrink-0 transition-colors',
                            isActive
                              ? 'text-primary'
                              : 'text-muted-foreground group-hover:text-foreground',
                          )}
                        />
                        {item.label}
                      </>
                    )}
                  </NavLink>
                )
              })}
            </div>
          </div>
        ))}
      </nav>
      <Separator />
      <div className="px-5 py-4 space-y-2">
        <p className="text-xs text-muted-foreground text-center">
          Made with <span className="text-primary">❤️</span> by Botang
        </p>
        <div className="flex items-center justify-center gap-3">
          <a
            href="https://instagram.com/alvinghzl"
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram"
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            {/* Instagram */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-4" aria-hidden="true">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
          </a>
          <a
            href="https://www.linkedin.com/in/alfianadiseptianto/"
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn"
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            {/* LinkedIn */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-4" aria-hidden="true">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
          </a>
          <a
            href="https://github.com/alfianadis"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            {/* GitHub */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-4" aria-hidden="true">
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
            </svg>
          </a>
          {/* <a
            href="https://trakteer.id/awwal.dev"
            target="_blank"
            rel="noreferrer"
            aria-label="Trakteer"
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            <Coffee className="size-4" />
          </a> */}
        </div>
      </div>
    </div>
  )
}

export function AppLayout() {
  const { user, signOut } = useAuth()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  // Close drawer on route change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMobileOpen(false)
  }, [location.pathname])

  // Close drawer on Escape
  useEffect(() => {
    if (!mobileOpen) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setMobileOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [mobileOpen])

  // current page title from path
  const allItems = NAV_GROUPS.flatMap((g) => g.items)
  const current =
    allItems.find((i) =>
      i.end ? location.pathname === i.to : location.pathname.startsWith(i.to),
    ) ?? allItems[0]

  return (
    <div className="flex min-h-svh bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r bg-sidebar lg:block">
        <div className="sticky top-0 h-svh">
          <SidebarContent />
        </div>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Menu navigasi"
            className="absolute left-0 top-0 h-full w-64 border-r bg-sidebar shadow-xl"
          >
            <button
              aria-label="Tutup menu"
              className="absolute right-3 top-4 text-muted-foreground"
              onClick={() => setMobileOpen(false)}
            >
              <X className="size-5" />
            </button>
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur-md sm:px-6">
          <Button
            aria-label="Buka menu"
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="size-5" />
          </Button>
          <div className="flex items-center gap-2">
            <current.icon className="size-5 text-primary" />
            <span className="font-semibold">{current.label}</span>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-xs font-medium leading-tight">
                {user?.email?.split('@')[0]}
              </p>
              <p className="text-[0.7rem] text-muted-foreground">Masuk</p>
            </div>
            <Avatar className="size-8">
              <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                {initials(user?.email?.split('@')[0])}
              </AvatarFallback>
            </Avatar>
            <Button
              aria-label="Keluar"
              variant="ghost"
              size="icon"
              onClick={() => signOut()}
              title="Keluar"
            >
              <LogOut className="size-[18px]" />
            </Button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
