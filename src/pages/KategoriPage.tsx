import { useMemo, useState, useEffect } from 'react'
import { Plus, Tags, Pencil, Trash2, Wallet } from 'lucide-react'
import { supabase } from '@/lib/supabase'
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
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { formatRupiah } from '@/lib/format'
import type { Kategori, Transaksi } from '@/lib/types'

const emptyForm = { nama: '', budget_rencana: '' }

export function KategoriPage() {
  const { rows, loading, insert, update, remove } = useCollection<Kategori>(
    'kategori',
    { orderBy: 'nama', ascending: true },
  )
  const [terpakai, setTerpakai] = useState<Record<string, number>>({})
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Kategori | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Kategori | null>(null)

  useEffect(() => {
    supabase
      .from('transaksi')
      .select('kategori, tipe, jumlah')
      .then(({ data, error }) => {
        if (error) {
          toast.error(`Gagal memuat transaksi: ${error.message}`)
          return
        }
        const map: Record<string, number> = {}
        ;((data ?? []) as Pick<Transaksi, 'kategori' | 'tipe' | 'jumlah'>[]).forEach(
          (t) => {
            if (t.tipe === 'pengeluaran' && t.kategori) {
              map[t.kategori] = (map[t.kategori] ?? 0) + Number(t.jumlah)
            }
          },
        )
        setTerpakai(map)
      })
  }, [rows])

  const totals = useMemo(() => {
    const budget = rows.reduce((s, k) => s + Number(k.budget_rencana), 0)
    const used = Object.values(terpakai).reduce((s, n) => s + n, 0)
    return { budget, used }
  }, [rows, terpakai])

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  function openEdit(k: Kategori) {
    setEditing(k)
    setForm({ nama: k.nama, budget_rencana: String(k.budget_rencana ?? '') })
    setDialogOpen(true)
  }

  async function handleSubmit() {
    if (!form.nama.trim()) return
    setSaving(true)
    const namaBaru = form.nama.trim()
    const payload = {
      nama: namaBaru,
      budget_rencana: Number(form.budget_rencana) || 0,
    }

    if (editing) {
      const namaLama = editing.nama
      const ok = await update(editing.id, payload)
      // Cascade rename to transaksi & vendor if the name changed
      if (ok && namaLama !== namaBaru) {
        const [trxRes, venRes] = await Promise.all([
          supabase
            .from('transaksi')
            .update({ kategori: namaBaru })
            .eq('kategori', namaLama),
          supabase
            .from('vendor')
            .update({ kategori: namaBaru })
            .eq('kategori', namaLama),
        ])
        if (trxRes.error || venRes.error) {
          toast.error('Kategori berubah tapi gagal memperbarui data terkait.')
        }
      }
      setSaving(false)
      if (ok) setDialogOpen(false)
    } else {
      const ok = await insert(payload)
      setSaving(false)
      if (ok) setDialogOpen(false)
    }
  }

  async function handleDelete(k: Kategori) {
    const used = terpakai[k.nama] ?? 0
    if (used > 0) {
      toast.error('Tidak bisa dihapus: kategori masih dipakai transaksi.')
      setDeleteTarget(null)
      return
    }
    await remove(k.id)
    setDeleteTarget(null)
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Kategori"
        description="Atur kategori anggaran & rencana budget"
        actions={
          <Button onClick={openCreate}>
            <Plus className="size-4" /> Tambah Kategori
          </Button>
        }
      />

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <StatCard
            label="Total Budget Rencana"
            value={formatRupiah(totals.budget)}
            icon={Tags}
            accent="blue"
          />
          <StatCard
            label="Total Terpakai"
            value={formatRupiah(totals.used)}
            icon={Wallet}
            accent={totals.used > totals.budget ? 'rose' : 'green'}
            hint={
              totals.budget > 0
                ? `${Math.round((totals.used / totals.budget) * 100)}% dari budget`
                : undefined
            }
          />
        </div>
      )}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-xl" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <EmptyState
          icon={Tags}
          title="Belum ada kategori"
          description="Buat kategori untuk mengelompokkan pengeluaran."
          action={
            <Button onClick={openCreate} variant="outline">
              <Plus className="size-4" /> Tambah Kategori
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((k) => {
            const used = terpakai[k.nama] ?? 0
            const budget = Number(k.budget_rencana)
            const pct =
              budget > 0 ? Math.min(100, Math.round((used / budget) * 100)) : 0
            const over = budget > 0 && used > budget
            return (
              <Card key={k.id} className="group">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold">{k.nama}</h3>
                    <div className="flex gap-1">
                      <Button aria-label="Edit"
                        size="icon"
                        variant="ghost"
                        className="size-7"
                        onClick={() => openEdit(k)}
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button aria-label="Hapus"
                        size="icon"
                        variant="ghost"
                        className="size-7 text-muted-foreground hover:text-destructive"
                        onClick={() => setDeleteTarget(k)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-3 space-y-1.5">
                    <div className="flex items-baseline justify-between">
                      <span
                        className={`text-lg font-semibold ${over ? 'text-destructive' : ''}`}
                      >
                        {formatRupiah(used)}
                      </span>
                      {budget > 0 && (
                        <span className="text-xs text-muted-foreground">
                          / {formatRupiah(budget)}
                        </span>
                      )}
                    </div>
                    {budget > 0 ? (
                      <Progress
                        value={pct}
                        className={over ? '[&>div]:bg-destructive' : ''}
                      />
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        Tanpa budget rencana
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {editing ? 'Edit Kategori' : 'Tambah Kategori'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nama Kategori</Label>
              <Input
                placeholder="mis. Dekorasi"
                value={form.nama}
                onChange={(e) => setForm((f) => ({ ...f, nama: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Budget Rencana (Rp)</Label>
              <CurrencyInput
                value={form.budget_rencana}
                onChange={(v) =>
                  setForm((f) => ({ ...f, budget_rencana: v }))
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
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title={`Hapus kategori "${deleteTarget?.nama}"?`}
        onConfirm={() => {
          if (deleteTarget) handleDelete(deleteTarget)
        }}
      />
    </div>
  )
}
