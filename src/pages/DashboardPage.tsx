import { useEffect, useState } from 'react'
import bouquetSvg from '@/assets/bouquet.svg'
import ringsSvg from '@/assets/wedding-rings.svg'
import { Link } from 'react-router-dom'
import {
  CalendarHeart,
  Wallet,
  TrendingDown,
  TrendingUp,
  ListChecks,
  Users,
  Store,
  ArrowRight,
} from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { useConfig } from '@/hooks/useConfig'
import { PageHeader } from '@/components/PageHeader'
import { StatCard } from '@/components/StatCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { formatRupiah, formatDateLong, relativeDays } from '@/lib/format'
import type { Transaksi, Checklist, Tamu, Vendor } from '@/lib/types'

interface Aggregates {
  pemasukan: number
  pengeluaran: number
  checklistTotal: number
  checklistDone: number
  tamuTotalOrang: number
  tamuHadir: number
  vendorDeal: number
  vendorTotal: number
}

export function DashboardPage() {
  const { config } = useConfig()
  const [agg, setAgg] = useState<Aggregates | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [trx, checklist, tamu, vendor] = await Promise.all([
        supabase.from('transaksi').select('tipe, jumlah'),
        supabase.from('checklist').select('status'),
        supabase.from('tamu').select('jumlah_orang, status_undangan'),
        supabase.from('vendor').select('status'),
      ])

      const firstError =
        trx.error || checklist.error || tamu.error || vendor.error
      if (firstError) {
        toast.error(`Gagal memuat dashboard: ${firstError.message}`)
        setLoading(false)
        return
      }

      const trxRows = (trx.data ?? []) as Pick<Transaksi, 'tipe' | 'jumlah'>[]
      const checkRows = (checklist.data ?? []) as Pick<Checklist, 'status'>[]
      const tamuRows = (tamu.data ?? []) as Pick<
        Tamu,
        'jumlah_orang' | 'status_undangan'
      >[]
      const vendorRows = (vendor.data ?? []) as Pick<Vendor, 'status'>[]

      setAgg({
        pemasukan: trxRows
          .filter((t) => t.tipe === 'pemasukan')
          .reduce((s, t) => s + Number(t.jumlah), 0),
        pengeluaran: trxRows
          .filter((t) => t.tipe === 'pengeluaran')
          .reduce((s, t) => s + Number(t.jumlah), 0),
        checklistTotal: checkRows.length,
        checklistDone: checkRows.filter((c) => c.status === 'selesai').length,
        tamuTotalOrang: tamuRows.reduce((s, t) => s + Number(t.jumlah_orang), 0),
        tamuHadir: tamuRows
          .filter((t) => t.status_undangan === 'hadir')
          .reduce((s, t) => s + Number(t.jumlah_orang), 0),
        vendorDeal: vendorRows.filter((v) => v.status !== 'kandidat').length,
        vendorTotal: vendorRows.length,
      })
      setLoading(false)
    }
    load()
  }, [])

  const countdown = relativeDays(config.tanggal_pernikahan)
  const saldo = (agg?.pemasukan ?? 0) - (agg?.pengeluaran ?? 0)
  const checklistPct = agg?.checklistTotal
    ? Math.round((agg.checklistDone / agg.checklistTotal) * 100)
    : 0

  return (
    <div className="space-y-8">
      <PageHeader
        title={
          config.nama_pasangan_1
            ? `Halo, ${config.nama_pasangan_1} & ${config.nama_pasangan_2} 👋`
            : 'Dashboard'
        }
        description="Ringkasan persiapan pernikahan kalian"
      />

      {/* Hero countdown */}
      <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-primary via-primary/90 to-primary/70 text-primary-foreground shadow-xl shadow-primary/25">
        {/* Decorative assets */}
        <img
          src={bouquetSvg}
          alt=""
          className="pointer-events-none absolute -left-4 -bottom-4 size-28 opacity-15 sm:size-36"
        />
        <img
          src={ringsSvg}
          alt=""
          className="pointer-events-none absolute bottom-2 right-28 size-14 opacity-20 sm:size-16"
        />

        <CardContent className="relative z-10 flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="flex items-center gap-5">
            <span className="flex size-16 items-center justify-center rounded-2xl bg-white/15 shadow-inner backdrop-blur-sm">
              <CalendarHeart className="size-8" />
            </span>
            <div>
              <p className="text-sm font-medium tracking-wide text-primary-foreground/70 uppercase">
                Menuju hari bahagia
              </p>
              <p className="mt-1 text-4xl font-bold tracking-tight sm:text-5xl">
                {loading ? '—' : countdown.label}
              </p>
            </div>
          </div>
          {config.tanggal_pernikahan && (
            <div className="rounded-xl bg-white/10 px-5 py-3 text-left backdrop-blur-sm sm:text-right">
              <p className="text-xs font-medium uppercase tracking-wider text-primary-foreground/60">
                Tanggal Pernikahan
              </p>
              <p className="mt-1 text-lg font-semibold">
                {formatDateLong(config.tanggal_pernikahan)}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Saldo"
            value={formatRupiah(saldo)}
            icon={Wallet}
            accent={saldo >= 0 ? 'green' : 'rose'}
            hint={`Masuk ${formatRupiah(agg!.pemasukan)}`}
          />
          <StatCard
            label="Pengeluaran"
            value={formatRupiah(agg!.pengeluaran)}
            icon={TrendingDown}
            accent="rose"
          />
          <StatCard
            label="Pemasukan"
            value={formatRupiah(agg!.pemasukan)}
            icon={TrendingUp}
            accent="green"
          />
          <StatCard
            label="Vendor Dipesan"
            value={`${agg!.vendorDeal}/${agg!.vendorTotal}`}
            icon={Store}
            accent="blue"
            hint="Sudah deal / total"
          />
        </div>
      )}

      {/* Progress cards */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="flex items-center gap-2 text-base">
              <ListChecks className="size-5 text-primary" />
              Progress Checklist
            </CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link to="/checklist">
                Lihat <ArrowRight className="size-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-end justify-between">
              <span className="text-3xl font-bold">{checklistPct}%</span>
              <span className="text-sm text-muted-foreground">
                {agg?.checklistDone ?? 0} dari {agg?.checklistTotal ?? 0} selesai
              </span>
            </div>
            <Progress value={checklistPct} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="size-5 text-primary" />
              Tamu Undangan
            </CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link to="/tamu">
                Lihat <ArrowRight className="size-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-end justify-between">
              <span className="text-3xl font-bold">
                {agg?.tamuTotalOrang ?? 0}
              </span>
              <span className="text-sm text-muted-foreground">
                {agg?.tamuHadir ?? 0} konfirmasi hadir
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Total estimasi orang yang diundang
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
