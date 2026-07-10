import { useMemo, useState, useEffect } from 'react'
import {
  Plus,
  Store,
  Pencil,
  Trash2,
  Phone,
  ExternalLink,
  CheckCircle2,
  CircleDollarSign,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useCollection } from '@/hooks/useCollection'
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
import { Card, CardContent } from '@/components/ui/card'
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
import { formatRupiah, safeUrl } from '@/lib/format'
import { toast } from 'sonner'
import type { Vendor, Kategori, VendorStatus } from '@/lib/types'

const STATUS_TONE: Record<VendorStatus, 'amber' | 'blue' | 'green'> = {
  kandidat: 'amber',
  deal: 'blue',
  lunas: 'green',
}
const STATUS_LABEL: Record<VendorStatus, string> = {
  kandidat: 'Kandidat',
  deal: 'Deal',
  lunas: 'Lunas',
}

const emptyForm = {
  nama: '',
  kategori: '',
  kontak: '',
  harga_deal: '',
  status: 'kandidat' as VendorStatus,
  dp_dibayar: '',
  catatan: '',
  link: '',
}

export function VendorPage() {
  const { rows, loading, insert, update, remove } = useCollection<Vendor>(
    'vendor',
    { orderBy: 'created_at', ascending: true },
  )
  const [kategoriList, setKategoriList] = useState<Kategori[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Vendor | null>(null)
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

  const stats = useMemo(() => {
    const totalDeal = rows.reduce((s, v) => s + Number(v.harga_deal), 0)
    const totalDp = rows.reduce((s, v) => s + Number(v.dp_dibayar), 0)
    const lunas = rows.filter((v) => v.status === 'lunas').length
    return { totalDeal, totalDp, sisa: totalDeal - totalDp, lunas }
  }, [rows])

  // status order: kandidat -> deal -> lunas
  const sorted = useMemo(() => {
    const order: Record<VendorStatus, number> = {
      kandidat: 0,
      deal: 1,
      lunas: 2,
    }
    return [...rows].sort((a, b) => order[a.status] - order[b.status])
  }, [rows])

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  function openEdit(v: Vendor) {
    setEditing(v)
    setForm({
      nama: v.nama,
      kategori: v.kategori ?? '',
      kontak: v.kontak ?? '',
      harga_deal: String(v.harga_deal ?? ''),
      status: v.status,
      dp_dibayar: String(v.dp_dibayar ?? ''),
      catatan: v.catatan ?? '',
      link: v.link ?? '',
    })
    setDialogOpen(true)
  }

  async function handleSubmit() {
    if (!form.nama.trim()) return
    setSaving(true)
    const payload = {
      nama: form.nama.trim(),
      kategori: form.kategori || null,
      kontak: form.kontak || null,
      harga_deal: Number(form.harga_deal) || 0,
      status: form.status,
      dp_dibayar: Number(form.dp_dibayar) || 0,
      catatan: form.catatan || null,
      link: form.link || null,
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
        title="Vendor"
        description="Kelola vendor, harga deal, dan pembayaran"
        actions={
          <Button onClick={openCreate}>
            <Plus className="size-4" /> Tambah Vendor
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
            label="Total Nilai Deal"
            value={formatRupiah(stats.totalDeal)}
            icon={Store}
            accent="blue"
          />
          <StatCard
            label="Sudah Dibayar"
            value={formatRupiah(stats.totalDp)}
            icon={CircleDollarSign}
            accent="green"
            hint={`Sisa ${formatRupiah(stats.sisa)}`}
          />
          <StatCard
            label="Vendor Lunas"
            value={`${stats.lunas}/${rows.length}`}
            icon={CheckCircle2}
            accent="rose"
          />
        </div>
      )}

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-xl" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <EmptyState
          icon={Store}
          title="Belum ada vendor"
          description="Tambahkan vendor pertama: venue, catering, MUA, dan lainnya."
          action={
            <Button onClick={openCreate} variant="outline">
              <Plus className="size-4" /> Tambah Vendor
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {sorted.map((v) => {
            const harga = Number(v.harga_deal)
            const dp = Number(v.dp_dibayar)
            const pct = harga > 0 ? Math.min(100, (dp / harga) * 100) : 0
            return (
              <Card key={v.id} className="group overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="truncate font-semibold">{v.nama}</h3>
                        <StatusBadge tone={STATUS_TONE[v.status]}>
                          {STATUS_LABEL[v.status]}
                        </StatusBadge>
                      </div>
                      {v.kategori && (
                        <p className="text-sm text-muted-foreground">
                          {v.kategori}
                        </p>
                      )}
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <Button aria-label="Edit"
                        size="icon"
                        variant="ghost"
                        className="size-8"
                        onClick={() => openEdit(v)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button aria-label="Hapus"
                        size="icon"
                        variant="ghost"
                        className="size-8 text-muted-foreground hover:text-destructive"
                        onClick={() => setDeleteId(v.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>

                  {harga > 0 && (
                    <div className="mt-4 space-y-1.5">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {formatRupiah(dp)} terbayar
                        </span>
                        <span className="font-medium">{formatRupiah(harga)}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      {harga - dp > 0 && (
                        <p className="text-xs text-muted-foreground">
                          Sisa {formatRupiah(harga - dp)}
                        </p>
                      )}
                    </div>
                  )}

                  {(v.kontak || v.link) && (
                    <div className="mt-4 flex flex-wrap gap-3 text-sm">
                      {v.kontak && (
                        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                          <Phone className="size-3.5" /> {v.kontak}
                        </span>
                      )}
                      {safeUrl(v.link) && (
                        <a
                          href={safeUrl(v.link)!}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-primary hover:underline"
                        >
                          <ExternalLink className="size-3.5" /> Link
                        </a>
                      )}
                    </div>
                  )}

                  {v.catatan && (
                    <p className="mt-3 text-sm text-muted-foreground">
                      {v.catatan}
                    </p>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Vendor' : 'Tambah Vendor'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nama Vendor</Label>
              <Input
                placeholder="mis. Catering Sederhana"
                value={form.nama}
                onChange={(e) => setForm((f) => ({ ...f, nama: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Kategori</Label>
                <Select
                  value={form.kategori || undefined}
                  onValueChange={(v) => setForm((f) => ({ ...f, kategori: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih" />
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
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, status: v as VendorStatus }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kandidat">Kandidat</SelectItem>
                    <SelectItem value="deal">Deal</SelectItem>
                    <SelectItem value="lunas">Lunas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Harga Deal (Rp)</Label>
                <CurrencyInput
                  value={form.harga_deal}
                  onChange={(v) => setForm((f) => ({ ...f, harga_deal: v }))}
                />
              </div>
              <div className="space-y-2">
                <Label>DP Dibayar (Rp)</Label>
                <CurrencyInput
                  value={form.dp_dibayar}
                  onChange={(v) => setForm((f) => ({ ...f, dp_dibayar: v }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Kontak</Label>
              <Input
                placeholder="No. HP / nama kontak"
                value={form.kontak}
                onChange={(e) =>
                  setForm((f) => ({ ...f, kontak: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Link (opsional)</Label>
              <Input
                placeholder="https://…"
                value={form.link}
                onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))}
              />
            </div>
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
            <Button onClick={handleSubmit} disabled={saving || !form.nama.trim()}>
              {saving ? 'Menyimpan…' : 'Simpan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Hapus vendor ini?"
        onConfirm={async () => {
          if (deleteId) await remove(deleteId)
          setDeleteId(null)
        }}
      />
    </div>
  )
}
