// Formatting helpers (Indonesian locale)

export function formatRupiah(value: number | null | undefined): string {
  const n = Number(value) || 0
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(n)
}

/**
 * Parse a value into a Date. Date-only strings (YYYY-MM-DD) are parsed as
 * LOCAL time to avoid the UTC off-by-one-day bug in non-UTC timezones.
 * Full ISO timestamps (with T) are parsed normally.
 */
function parseLocalDate(value: string): Date {
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value)
  if (dateOnly) {
    const [y, m, d] = value.split('-').map(Number)
    return new Date(y, m - 1, d)
  }
  return new Date(value)
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return '—'
  const d = parseLocalDate(value)
  if (Number.isNaN(d.getTime())) return '—'
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(d)
}

/** "Minggu, 28 Maret 2027" — long format with weekday */
export function formatDateLong(value: string | null | undefined): string {
  if (!value) return '—'
  const d = parseLocalDate(value)
  if (Number.isNaN(d.getTime())) return '—'
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(d)
}

/** "3 hari lagi" / "hari ini" / "5 hari lalu" relative to today */
export function relativeDays(dateStr: string | null | undefined): {
  days: number | null
  label: string
} {
  if (!dateStr) return { days: null, label: '—' }
  const target = parseLocalDate(dateStr)
  if (Number.isNaN(target.getTime())) return { days: null, label: '—' }
  target.setHours(0, 0, 0, 0)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const days = Math.round((target.getTime() - today.getTime()) / 86_400_000)
  if (days === 0) return { days, label: 'Hari ini' }
  if (days > 0) return { days, label: `${days} hari lagi` }
  return { days, label: `${Math.abs(days)} hari lalu` }
}

export function initials(text: string | null | undefined): string {
  if (!text) return '?'
  return text
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}

/**
 * Returns a safe href only if the URL is http(s). Otherwise null.
 * Prevents javascript:/data: URL injection in user-provided links.
 */
export function safeUrl(value: string | null | undefined): string | null {
  if (!value) return null
  const trimmed = value.trim()
  try {
    const url = new URL(trimmed)
    if (url.protocol === 'http:' || url.protocol === 'https:') {
      return url.href
    }
    return null
  } catch {
    // Not an absolute URL — try prefixing https:// for bare domains
    if (/^[\w-]+(\.[\w-]+)+/.test(trimmed)) {
      return `https://${trimmed}`
    }
    return null
  }
}

