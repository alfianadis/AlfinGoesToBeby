import { forwardRef } from 'react'
import { Input } from '@/components/ui/input'

interface CurrencyInputProps {
  /** numeric value as string (raw digits) or empty */
  value: string
  onChange: (rawValue: string) => void
  placeholder?: string
  id?: string
  disabled?: boolean
}

/** Group digits with Indonesian thousands separator (dot). */
function formatThousands(raw: string): string {
  if (!raw) return ''
  const digits = raw.replace(/\D/g, '')
  if (!digits) return ''
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

/**
 * Currency input that displays a thousands separator (1.000.000) while
 * storing the raw numeric string ("1000000") via onChange.
 */
export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  function CurrencyInput({ value, onChange, placeholder, id, disabled }, ref) {
    return (
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
          Rp
        </span>
        <Input
          ref={ref}
          id={id}
          type="text"
          inputMode="numeric"
          disabled={disabled}
          className="pl-9"
          placeholder={placeholder ?? '0'}
          value={formatThousands(value)}
          onChange={(e) => onChange(e.target.value.replace(/\D/g, ''))}
        />
      </div>
    )
  },
)
