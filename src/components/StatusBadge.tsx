import { cn } from '@/lib/utils'

type Tone = 'neutral' | 'rose' | 'amber' | 'green' | 'blue' | 'red'

const toneMap: Record<Tone, string> = {
  neutral: 'bg-muted text-muted-foreground ring-border',
  rose: 'bg-accent text-primary ring-primary/20',
  amber:
    'bg-amber-100 text-amber-800 ring-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:ring-amber-900',
  green:
    'bg-emerald-100 text-emerald-800 ring-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:ring-emerald-900',
  blue: 'bg-sky-100 text-sky-800 ring-sky-200 dark:bg-sky-950/50 dark:text-sky-300 dark:ring-sky-900',
  red: 'bg-red-100 text-red-800 ring-red-200 dark:bg-red-950/50 dark:text-red-300 dark:ring-red-900',
}

export function StatusBadge({
  children,
  tone = 'neutral',
  className,
}: {
  children: React.ReactNode
  tone?: Tone
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
        toneMap[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}
