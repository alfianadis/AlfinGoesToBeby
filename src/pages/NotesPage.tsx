import { useState } from 'react'
import {
  Plus,
  StickyNote,
  Pencil,
  Trash2,
  ExternalLink,
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
import { formatDate, safeUrl } from '@/lib/format'
import type { Notes } from '@/lib/types'

const emptyForm = { judul: '', isi: '', link: '' }

export function NotesPage() {
  const { rows, loading, insert, update, remove } = useCollection<Notes>(
    'notes',
    { orderBy: 'created_at', ascending: false },
  )
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Notes | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  function openEdit(n: Notes) {
    setEditing(n)
    setForm({ judul: n.judul, isi: n.isi ?? '', link: n.link ?? '' })
    setDialogOpen(true)
  }

  async function handleSubmit() {
    if (!form.judul.trim()) return
    setSaving(true)
    const payload = {
      judul: form.judul.trim(),
      isi: form.isi || null,
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
        title="Catatan"
        description="Simpan ide, referensi, dan catatan penting"
        actions={
          <Button onClick={openCreate}>
            <Plus className="size-4" /> Tambah Catatan
          </Button>
        }
      />

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <EmptyState
          icon={StickyNote}
          title="Belum ada catatan"
          description="Tambahkan catatan untuk menyimpan ide atau referensi."
          action={
            <Button onClick={openCreate} variant="outline">
              <Plus className="size-4" /> Tambah Catatan
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((n) => (
            <Card key={n.id} className="group flex flex-col">
              <CardContent className="flex flex-1 flex-col p-5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold leading-tight">{n.judul}</h3>
                  <div className="flex shrink-0 gap-1">
                    <Button aria-label="Edit"
                      size="icon"
                      variant="ghost"
                      className="size-7"
                      onClick={() => openEdit(n)}
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button aria-label="Hapus"
                      size="icon"
                      variant="ghost"
                      className="size-7 text-muted-foreground hover:text-destructive"
                      onClick={() => setDeleteId(n.id)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
                {n.isi && (
                  <p className="mt-2 flex-1 whitespace-pre-wrap text-sm text-muted-foreground">
                    {n.isi}
                  </p>
                )}
                <div className="mt-3 flex items-center justify-between">
                  {safeUrl(n.link) ? (
                    <a
                      href={safeUrl(n.link)!}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                    >
                      <ExternalLink className="size-3.5" /> Buka link
                    </a>
                  ) : (
                    <span />
                  )}
                  <span className="text-xs text-muted-foreground">
                    {formatDate(n.created_at)}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing ? 'Edit Catatan' : 'Tambah Catatan'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Judul</Label>
              <Input
                placeholder="mis. Ide dekorasi"
                value={form.judul}
                onChange={(e) =>
                  setForm((f) => ({ ...f, judul: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Isi (opsional)</Label>
              <Textarea
                rows={5}
                value={form.isi}
                onChange={(e) => setForm((f) => ({ ...f, isi: e.target.value }))}
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Batal
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={saving || !form.judul.trim()}
            >
              {saving ? 'Menyimpan…' : 'Simpan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Hapus catatan ini?"
        onConfirm={async () => {
          if (deleteId) await remove(deleteId)
          setDeleteId(null)
        }}
      />
    </div>
  )
}
