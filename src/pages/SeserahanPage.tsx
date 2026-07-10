import { useMemo, useState } from 'react'
import {
  Plus,
  Gift,
  Pencil,
  Trash2,
  Check,
  ExternalLink,
  ShoppingBag,
} from 'lucide-react'
import { useCollection } from '@/hooks/useCollection'
import { PageHeader } from '@/components/PageHeader'
import { StatCard } from '@/components/StatCard'
import { EmptyState } from '@/components/EmptyState'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { CurrencyInput } from '@/components/CurrencyInput'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { cn } from '@/lib/utils'
import { formatRupiah, safeUrl } from '@/lib/format'
import type { Seserahan, SeserahanStatus } from '@/lib/types'

const emptyForm = {
  item: '',
  kategori: '',
  brand: '',
  harga: '',
  link: '',
  status: 'rencana' as SeserahanStatus,
}

export function SeserahanPage() {
  const { rows, loading, insert, update, remove } = useCollection<Seserahan>(
    'seserahan',
    { orderBy: 'created_at', ascending: true },
  )
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Seserahan | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const stats = useMemo(() => {
    const total = rows.reduce((s, i) => s + Number(i.harga), 0)
    const sudah = rows.filter((i) => i.status === 'sudah dibeli')
    const sudahHarga = sudah.reduce((s, i) => s + Number(i.harga), 0)
    return { total, sudahHarga, sudahCount: sudah.length, count: rows.length }
  }, [rows])

  const grouped = useMemo(() => {
    const groups: Record<string, Seserahan[]> = {}
    rows.forEach((i) => {
      const key = i.kategori || 'Lainnya'
      ;(groups[key] ??= []).push(i)
    })
    return groups
  }, [rows])

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  function openEdit(s: Seserahan) {
    setEditing(s)
    setForm({
      item: s.item,
      kategori: s.kategori ?? '',
      brand: s.brand ?? '',
      harga: String(s.harga ?? ''),
      link: s.link ?? '',
      status: s.status,
    })
    setDialogOpen(true)
  }

  async function toggleStatus(s: Seserahan) {
    await update(s.id, {
      status: s.status === 'sudah dibeli' ? 'rencana' : 'sudah dibeli',
    })
  }

  async function handleSubmit() {
    if (!form.item.trim()) return
    setSaving(true)
    const payload = {
      item: form.item.trim(),
      kategori: form.kategori || null,
      brand: form.brand || null,
      harga: Number(form.harga) || 0,
      link: form.link || null,
      status: form.status,
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
        title="Seserahan"
        description="Daftar item seserahan & status pembelian"
        actions={
          <Button onClick={openCreate}>
            <Plus className="size-4" /> Tambah Item
          </Button>
        }
      />

      {loading ? (
        <Skeleton className="h-28 rounded-xl" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            label="Total Item"
            value={`${stats.sudahCount}/${stats.count}`}
            icon={Gift}
            accent="rose"
            hint="Sudah dibeli / total"
          />
          <StatCard
            label="Estimasi Total"
            value={formatRupiah(stats.total)}
            icon={ShoppingBag}
            accent="blue"
          />
          <StatCard
            label="Sudah Dibeli"
            value={formatRupiah(stats.sudahHarga)}
            icon={Check}
            accent="green"
          />
        </div>
      )}

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-lg" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <EmptyState
          icon={Gift}
          title="Belum ada item seserahan"
          description="Tambahkan item seserahan dan tandai saat sudah dibeli."
          action={
            <Button onClick={openCreate} variant="outline">
              <Plus className="size-4" /> Tambah Item
            </Button>
          }
        />
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([kategori, items]) => (
            <div key={kategori}>
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {kategori}
              </h3>
              <Card>
                <CardContent className="divide-y p-0">
                  {items.map((s) => (
                    <div
                      key={s.id}
                      className="group flex items-center gap-3 px-4 py-3"
                    >
                      <button onClick={() => toggleStatus(s)} className="shrink-0">
                        <span
                          className={cn(
                            'flex size-5 items-center justify-center rounded-full border-2 transition-colors',
                            s.status === 'sudah dibeli'
                              ? 'border-emerald-600 bg-emerald-600 text-white'
                              : 'border-muted-foreground/40',
                          )}
                        >
                          {s.status === 'sudah dibeli' && (
                            <Check className="size-3" />
                          )}
                        </span>
                      </button>
                      <div className="min-w-0 flex-1">
                        <p
                          className={cn(
                            'truncate text-sm font-medium',
                            s.status === 'sudah dibeli' &&
                              'text-muted-foreground line-through',
                          )}
                        >
                          {s.item}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-3 text-xs text-muted-foreground">
                          {s.brand && <span>{s.brand}</span>}
                          {safeUrl(s.link) && (
                            <a
                              href={safeUrl(s.link)!}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-primary hover:underline"
                            >
                              <ExternalLink className="size-3" /> Link
                            </a>
                          )}
                        </div>
                      </div>
                      {s.harga > 0 && (
                        <span className="shrink-0 text-sm font-medium">
                          {formatRupiah(s.harga)}
                        </span>
                      )}
                      <div className="flex shrink-0 gap-1">
                        <Button aria-label="Edit"
                          size="icon"
                          variant="ghost"
                          className="size-8"
                          onClick={() => openEdit(s)}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button aria-label="Hapus"
                          size="icon"
                          variant="ghost"
                          className="size-8 text-muted-foreground hover:text-destructive"
                          onClick={() => setDeleteId(s.id)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Item' : 'Tambah Item'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nama Item</Label>
              <Input
                placeholder="mis. Mukena"
                value={form.item}
                onChange={(e) => setForm((f) => ({ ...f, item: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Kategori</Label>
                <Input
                  placeholder="mis. Pakaian"
                  value={form.kategori}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, kategori: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Brand (opsional)</Label>
                <Input
                  value={form.brand}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, brand: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Harga (Rp)</Label>
                <CurrencyInput
                  value={form.harga}
                  onChange={(v) => setForm((f) => ({ ...f, harga: v }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, status: v as SeserahanStatus }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rencana">Rencana</SelectItem>
                    <SelectItem value="sudah dibeli">Sudah dibeli</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Link (opsional)</Label>
              <Input
                placeholder="https://…"
                value={form.link}
                onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleSubmit} disabled={saving || !form.item.trim()}>
              {saving ? 'Menyimpan…' : 'Simpan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Hapus item ini?"
        onConfirm={async () => {
          if (deleteId) await remove(deleteId)
          setDeleteId(null)
        }}
      />
    </div>
  )
}
