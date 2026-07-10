import { useMemo, useState } from 'react'
import {
  Plus,
  Contact,
  Pencil,
  Trash2,
  Phone,
  MessageCircle,
} from 'lucide-react'
import { useCollection } from '@/hooks/useCollection'
import { PageHeader } from '@/components/PageHeader'
import { EmptyState } from '@/components/EmptyState'
import { ConfirmDialog } from '@/components/ConfirmDialog'
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
import { initials } from '@/lib/format'
import type { Kontak } from '@/lib/types'

const emptyForm = {
  nama: '',
  peran: '',
  telepon: '',
  kategori: '',
  catatan: '',
}

/** Normalize a phone number into international format for wa.me / tel. */
/** Normalize an Indonesian phone number to international format for wa.me. */
function waNumber(phone: string): string {
  const digits = phone.replace(/[^0-9]/g, '')
  if (digits.length < 7) return '' // too short to be valid
  if (digits.startsWith('0')) return '62' + digits.slice(1)
  if (digits.startsWith('62')) return digits
  if (digits.startsWith('8')) return '62' + digits // bare mobile number
  return digits
}

export function KontakPage() {
  const { rows, loading, insert, update, remove } = useCollection<Kontak>(
    'kontak',
    { orderBy: 'created_at', ascending: true },
  )
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Kontak | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const groups = useMemo(() => {
    const map: Record<string, Kontak[]> = {}
    rows.forEach((k) => {
      const key = k.kategori || 'Lainnya'
      ;(map[key] ??= []).push(k)
    })
    return Object.entries(map).sort((a, b) => a[0].localeCompare(b[0]))
  }, [rows])

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  function openEdit(k: Kontak) {
    setEditing(k)
    setForm({
      nama: k.nama,
      peran: k.peran ?? '',
      telepon: k.telepon ?? '',
      kategori: k.kategori ?? '',
      catatan: k.catatan ?? '',
    })
    setDialogOpen(true)
  }

  async function handleSubmit() {
    if (!form.nama.trim()) return
    setSaving(true)
    const payload = {
      nama: form.nama.trim(),
      peran: form.peran || null,
      telepon: form.telepon || null,
      kategori: form.kategori || null,
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
        title="Kontak Penting"
        description="Daftar kontak vendor, panitia, dan keluarga"
        actions={
          <Button onClick={openCreate}>
            <Plus className="size-4" /> Tambah Kontak
          </Button>
        }
      />

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <EmptyState
          icon={Contact}
          title="Belum ada kontak"
          description="Simpan kontak penting agar mudah dihubungi saat hari-H."
          action={
            <Button onClick={openCreate} variant="outline">
              <Plus className="size-4" /> Tambah Kontak
            </Button>
          }
        />
      ) : (
        <div className="space-y-6">
          {groups.map(([kategori, items]) => (
            <div key={kategori}>
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {kategori}
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((k) => (
                  <Card key={k.id} className="group">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                          {initials(k.nama)}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium">{k.nama}</p>
                          {k.peran && (
                            <p className="truncate text-sm text-muted-foreground">
                              {k.peran}
                            </p>
                          )}
                        </div>
                        <div className="flex shrink-0 gap-1">
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
                            onClick={() => setDeleteId(k.id)}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </div>

                      {k.catatan && (
                        <p className="mt-3 text-sm text-muted-foreground">
                          {k.catatan}
                        </p>
                      )}

                      {k.telepon && (
                        <div className="mt-3 flex items-center gap-2">
                          <a
                            href={`tel:${k.telepon}`}
                            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md border px-2.5 py-1.5 text-sm font-medium transition-colors hover:bg-muted"
                          >
                            <Phone className="size-3.5" /> Telepon
                          </a>
                          {waNumber(k.telepon) && (
                            <a
                              href={`https://wa.me/${waNumber(k.telepon)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md bg-emerald-600 px-2.5 py-1.5 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
                            >
                              <MessageCircle className="size-3.5" /> WhatsApp
                            </a>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing ? 'Edit Kontak' : 'Tambah Kontak'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nama</Label>
              <Input
                placeholder="mis. Pak Budi"
                value={form.nama}
                onChange={(e) => setForm((f) => ({ ...f, nama: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Peran</Label>
                <Input
                  placeholder="mis. Penghulu"
                  value={form.peran}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, peran: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Kategori</Label>
                <Input
                  placeholder="mis. Vendor"
                  value={form.kategori}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, kategori: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>No. Telepon</Label>
              <Input
                type="tel"
                placeholder="mis. 0812xxxxxxx"
                value={form.telepon}
                onChange={(e) =>
                  setForm((f) => ({ ...f, telepon: e.target.value }))
                }
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
        title="Hapus kontak ini?"
        onConfirm={async () => {
          if (deleteId) await remove(deleteId)
          setDeleteId(null)
        }}
      />
    </div>
  )
}
