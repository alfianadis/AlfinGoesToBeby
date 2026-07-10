import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'

interface StatCardProps {
  label: string
  value: string | number
  icon?: LucideIcon
  hint?: string
  accent?: 'default' | 'rose' | 'amber' | 'green' | 'blue'
  className?: string
}

const accentMap: Record<NonNullable<StatCardProps['accent']>, string> = {
  default: 'text-muted-foreground bg-muted',
  rose: 'text-primary bg-accent',
  amber: 'text-amber-700 bg-amber-100 dark:text-amber-300 dark:bg-amber-950/50',
  green: 'text-emerald-700 bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-950/50',
  blue: 'text-sky-700 bg-sky-100 dark:text-sky-300 dark:bg-sky-950/50',
}

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  accent = 'default',
  className,
}: StatCardProps) {
  return (
    <Card className={cn('p-5', className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="truncate text-2xl font-semibold tracking-tight">
            {value}
          </p>
          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
        {Icon && (
          <span
            className={cn(
              'flex size-10 shrink-0 items-center justify-center rounded-lg',
              accentMap[accent],
            )}
          >
            <Icon className="size-5" />
          </span>
        )}
      </div>
    </Card>
  )
}
