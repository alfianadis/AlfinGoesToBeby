import { useMemo, useState, useEffect } from 'react'
import {
  Plus,
  Wallet,
  TrendingUp,
  TrendingDown,
  Pencil,
  Trash2,
  ArrowDownCircle,
  ArrowUpCircle,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useCollection } from '@/hooks/useCollection'
import { useConfig } from '@/hooks/useConfig'
import { PageHeader } from '@/components/PageHeader'
import { StatCard } from '@/components/StatCard'
import { EmptyState } from '@/components/EmptyState'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { CurrencyInput } from '@/components/CurrencyInput'
import { StatusBadge } from '@/components/StatusBadge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatRupiah, formatDate } from '@/lib/format'
import { toast } from 'sonner'
import type { Transaksi, Kategori, TransaksiTipe } from '@/lib/types'

const emptyForm = {
  tanggal: new Date().toISOString().slice(0, 10),
  tipe: 'pengeluaran' as TransaksiTipe,
  kategori: '',
  deskripsi: '',
  jumlah: '',
  dibayar_oleh: '',
  catatan: '',
}

export function KeuanganPage() {
  const { rows, loading, insert, update, remove } = useCollection<Transaksi>(
    'transaksi',
    { orderBy: 'tanggal', ascending: false },
  )
  const { config } = useConfig()
  const [kategoriList, setKategoriList] = useState<Kategori[]>([])

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Transaksi | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  useEffect(() => {
    supabase
      .from('kategori')
      .select('*')
      .order('nama')
      .then(({ data, error }) => {
        if (error) {
          toast.error(`Gagal memuat kategori: ${error.message}`)
          return
        }
        setKategoriList((data ?? []) as Kategori[])
      })
  }, [])

  const pembayar = [config.nama_pasangan_1, config.nama_pasangan_2].filter(
    Boolean,
  ) as string[]

  const totals = useMemo(() => {
    const pemasukan = rows
      .filter((t) => t.tipe === 'pemasukan')
      .reduce((s, t) => s + Number(t.jumlah), 0)
    const pengeluaran = rows
      .filter((t) => t.tipe === 'pengeluaran')
      .reduce((s, t) => s + Number(t.jumlah), 0)
    return { pemasukan, pengeluaran, saldo: pemasukan - pengeluaran }
  }, [rows])

  const ringkasan = useMemo(() => {
    const terpakai: Record<string, number> = {}
    rows.forEach((t) => {
      if (t.tipe === 'pengeluaran' && t.kategori) {
        terpakai[t.kategori] = (terpakai[t.kategori] ?? 0) + Number(t.jumlah)
      }
    })
    return kategoriList
      .map((k) => ({
        nama: k.nama,
        budget: Number(k.budget_rencana),
        terpakai: terpakai[k.nama] ?? 0,
      }))
      .filter((k) => k.budget > 0 || k.terpakai > 0)
  }, [rows, kategoriList])

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  function openEdit(t: Transaksi) {
    setEditing(t)
    setForm({
      tanggal: t.tanggal ?? new Date().toISOString().slice(0, 10),
      tipe: t.tipe,
      kategori: t.kategori ?? '',
      deskripsi: t.deskripsi ?? '',
      jumlah: String(t.jumlah ?? ''),
      dibayar_oleh: t.dibayar_oleh ?? '',
      catatan: t.catatan ?? '',
    })
    setDialogOpen(true)
  }

  async function handleSubmit() {
    if (!form.deskripsi.trim() || !form.jumlah) return
    setSaving(true)
    const payload = {
      tanggal: form.tanggal || null,
      tipe: form.tipe,
      kategori: form.tipe === 'pengeluaran' ? form.kategori || null : null,
      deskripsi: form.deskripsi.trim(),
      jumlah: Number(form.jumlah) || 0,
      dibayar_oleh: form.dibayar_oleh || null,
      catatan: form.catatan || null,
    }
    const ok = editing
      ? await update(editing.id, payload)
      : await insert(payload)
    setSaving(false)
    if (ok) setDialogOpen(false)
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Keuangan"
        description="Catat pemasukan & pengeluaran persiapan pernikahan"
        actions={
          <Button onClick={openCreate}>
            <Plus className="size-4" /> Tambah Transaksi
          </Button>
        }
      />

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            label="Saldo"
            value={formatRupiah(totals.saldo)}
            icon={Wallet}
            accent={totals.saldo >= 0 ? 'green' : 'rose'}
          />
          <StatCard
            label="Total Pemasukan"
            value={formatRupiah(totals.pemasukan)}
            icon={TrendingUp}
            accent="green"
          />
          <StatCard
            label="Total Pengeluaran"
            value={formatRupiah(totals.pengeluaran)}
            icon={TrendingDown}
            accent="rose"
          />
        </div>
      )}

      {/* Ringkasan per kategori */}
      {ringkasan.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Anggaran per Kategori</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-2">
            {ringkasan.map((k) => {
              const pct =
                k.budget > 0
                  ? Math.min(100, Math.round((k.terpakai / k.budget) * 100))
                  : 0
              const over = k.budget > 0 && k.terpakai > k.budget
              return (
                <div key={k.nama} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{k.nama}</span>
                    <span
                      className={
                        over ? 'text-destructive' : 'text-muted-foreground'
                      }
                    >
                      {formatRupiah(k.terpakai)}
                      {k.budget > 0 && (
                        <span className="text-muted-foreground">
                          {' '}
                          / {formatRupiah(k.budget)}
                        </span>
                      )}
                    </span>
                  </div>
                  {k.budget > 0 && (
                    <Progress
                      value={pct}
                      className={over ? '[&>div]:bg-destructive' : ''}
                    />
                  )}
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      {/* Daftar transaksi */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Daftar Transaksi</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 rounded-lg" />
              ))}
            </div>
          ) : rows.length === 0 ? (
            <EmptyState
              icon={Wallet}
              title="Belum ada transaksi"
              description="Mulai catat pemasukan atau pengeluaran pertama kalian."
              action={
                <Button onClick={openCreate} variant="outline">
                  <Plus className="size-4" /> Tambah Transaksi
                </Button>
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Deskripsi</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Oleh</TableHead>
                    <TableHead className="text-right">Jumlah</TableHead>
                    <TableHead className="w-20" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {formatDate(t.tanggal)}
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {t.tipe === 'pemasukan' ? (
                            <ArrowUpCircle className="size-4 text-emerald-600" />
                          ) : (
                            <ArrowDownCircle className="size-4 text-primary" />
                          )}
                          {t.deskripsi}
                        </div>
                        {t.catatan && (
                          <p className="ml-6 text-xs text-muted-foreground">
                            {t.catatan}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        {t.kategori ? (
                          <StatusBadge tone="rose">{t.kategori}</StatusBadge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {t.dibayar_oleh || '—'}
                      </TableCell>
                      <TableCell
                        className={`text-right font-semibold whitespace-nowrap ${
                          t.tipe === 'pemasukan'
                            ? 'text-emerald-600'
                            : 'text-foreground'
                        }`}
                      >
                        {t.tipe === 'pemasukan' ? '+' : '−'}
                        {formatRupiah(t.jumlah)}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button aria-label="Edit"
                            size="icon"
                            variant="ghost"
                            className="size-8"
                            onClick={() => openEdit(t)}
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button aria-label="Hapus"
                            size="icon"
                            variant="ghost"
                            className="size-8 text-muted-foreground hover:text-destructive"
                            onClick={() => setDeleteId(t.id)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing ? 'Edit Transaksi' : 'Tambah Transaksi'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Tipe</Label>
                <Select
                  value={form.tipe}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, tipe: v as TransaksiTipe }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pengeluaran">Pengeluaran</SelectItem>
                    <SelectItem value="pemasukan">Pemasukan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tanggal</Label>
                <Input
                  type="date"
                  value={form.tanggal}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, tanggal: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Deskripsi</Label>
              <Input
                placeholder="mis. DP catering"
                value={form.deskripsi}
                onChange={(e) =>
                  setForm((f) => ({ ...f, deskripsi: e.target.value }))
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Jumlah (Rp)</Label>
                <CurrencyInput
                  value={form.jumlah}
                  onChange={(v) => setForm((f) => ({ ...f, jumlah: v }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Dibayar oleh</Label>
                <Select
                  value={form.dibayar_oleh || undefined}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, dibayar_oleh: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih" />
                  </SelectTrigger>
                  <SelectContent>
                    {pembayar.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {form.tipe === 'pengeluaran' && (
              <div className="space-y-2">
                <Label>Kategori</Label>
                <Select
                  value={form.kategori || undefined}
                  onValueChange={(v) => setForm((f) => ({ ...f, kategori: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {kategoriList.map((k) => (
                      <SelectItem key={k.id} value={k.nama}>
                        {k.nama}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>Catatan (opsional)</Label>
              <Textarea
                rows={2}
                value={form.catatan}
                onChange={(e) =>
                  setForm((f) => ({ ...f, catatan: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Batal
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={saving || !form.deskripsi.trim() || !form.jumlah}
            >
              {saving ? 'Menyimpan…' : 'Simpan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Hapus transaksi ini?"
        onConfirm={async () => {
          if (deleteId) await remove(deleteId)
          setDeleteId(null)
        }}
      />
    </div>
  )
}
