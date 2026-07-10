import { useMemo, useState } from 'react'
import { Plus, Clock, Pencil, Trash2, MapPin, User } from 'lucide-react'
import { useCollection } from '@/hooks/useCollection'
import { useConfig } from '@/hooks/useConfig'
import { PageHeader } from '@/components/PageHeader'
import { EmptyState } from '@/components/EmptyState'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
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
import type { Rundown } from '@/lib/types'

const emptyForm = {
  acara: '',
  waktu_mulai: '',
  waktu_selesai: '',
  lokasi: '',
  pic: '',
  catatan: '',
}

export function RundownPage() {
  const { rows, loading, insert, update, remove } = useCollection<Rundown>(
    'rundown',
    { orderBy: 'created_at', ascending: true },
  )
  const { config } = useConfig()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Rundown | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const picOptions = [config.nama_pasangan_1, config.nama_pasangan_2].filter(
    Boolean,
  ) as string[]

  const sorted = useMemo(() => {
    return [...rows].sort((a, b) => {
      const x = a.waktu_mulai || '99:99'
      const y = b.waktu_mulai || '99:99'
      return x < y ? -1 : x > y ? 1 : 0
    })
  }, [rows])

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  function openEdit(r: Rundown) {
    setEditing(r)
    setForm({
      acara: r.acara,
      waktu_mulai: r.waktu_mulai ?? '',
      waktu_selesai: r.waktu_selesai ?? '',
      lokasi: r.lokasi ?? '',
      pic: r.pic ?? '',
      catatan: r.catatan ?? '',
    })
    setDialogOpen(true)
  }

  async function handleSubmit() {
    if (!form.acara.trim()) return
    setSaving(true)
    const payload = {
      acara: form.acara.trim(),
      waktu_mulai: form.waktu_mulai || null,
      waktu_selesai: form.waktu_selesai || null,
      lokasi: form.lokasi || null,
      pic: form.pic || null,
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
        title="Rundown"
        description="Susunan acara hari pernikahan"
        actions={
          <Button onClick={openCreate}>
            <Plus className="size-4" /> Tambah Acara
          </Button>
        }
      />

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <EmptyState
          icon={Clock}
          title="Belum ada susunan acara"
          description="Tambahkan agenda acara beserta waktunya untuk menyusun rundown."
          action={
            <Button onClick={openCreate} variant="outline">
              <Plus className="size-4" /> Tambah Acara
            </Button>
          }
        />
      ) : (
        <div className="relative space-y-0 pl-4">
          {/* vertical timeline line */}
          <div className="absolute bottom-4 left-4 top-4 w-px bg-border" />
          {sorted.map((r) => (
            <div key={r.id} className="group relative flex gap-4 pb-4">
              <div className="relative z-10 mt-1.5 flex size-3 shrink-0 -translate-x-1/2 items-center justify-center">
                <span className="size-3 rounded-full border-2 border-primary bg-background" />
              </div>
              <Card className="flex-1 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      {r.waktu_mulai && (
                        <span className="rounded-md bg-primary/10 px-2 py-0.5 text-sm font-semibold text-primary">
                          {r.waktu_mulai}
                          {r.waktu_selesai && ` – ${r.waktu_selesai}`}
                        </span>
                      )}
                    </div>
                    <h3 className="mt-1.5 font-semibold">{r.acara}</h3>
                    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      {r.lokasi && (
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="size-3.5" /> {r.lokasi}
                        </span>
                      )}
                      {r.pic && (
                        <span className="inline-flex items-center gap-1.5">
                          <User className="size-3.5" /> {r.pic}
                        </span>
                      )}
                    </div>
                    {r.catatan && (
                      <p className="mt-2 text-sm text-muted-foreground">
                        {r.catatan}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button aria-label="Edit"
                      size="icon"
                      variant="ghost"
                      className="size-8"
                      onClick={() => openEdit(r)}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button aria-label="Hapus"
                      size="icon"
                      variant="ghost"
                      className="size-8 text-muted-foreground hover:text-destructive"
                      onClick={() => setDeleteId(r.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Acara' : 'Tambah Acara'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nama Acara</Label>
              <Input
                placeholder="mis. Akad Nikah"
                value={form.acara}
                onChange={(e) =>
                  setForm((f) => ({ ...f, acara: e.target.value }))
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Waktu Mulai</Label>
                <Input
                  type="time"
                  value={form.waktu_mulai}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, waktu_mulai: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Waktu Selesai</Label>
                <Input
                  type="time"
                  value={form.waktu_selesai}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, waktu_selesai: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Lokasi</Label>
              <Input
                placeholder="mis. Masjid Al-Ikhlas"
                value={form.lokasi}
                onChange={(e) =>
                  setForm((f) => ({ ...f, lokasi: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Penanggung Jawab</Label>
              <Select
                value={form.pic || undefined}
                onValueChange={(v) => setForm((f) => ({ ...f, pic: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih" />
                </SelectTrigger>
                <SelectContent>
                  {picOptions.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
            <Button
              onClick={handleSubmit}
              disabled={saving || !form.acara.trim()}
            >
              {saving ? 'Menyimpan…' : 'Simpan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Hapus acara ini?"
        onConfirm={async () => {
          if (deleteId) await remove(deleteId)
          setDeleteId(null)
        }}
      />
    </div>
  )
}
