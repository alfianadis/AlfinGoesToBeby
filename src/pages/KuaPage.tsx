import { useMemo, useState } from 'react'
import { Plus, FileText, Pencil, Trash2 } from 'lucide-react'
import { useCollection } from '@/hooks/useCollection'
import { PageHeader } from '@/components/PageHeader'
import { StatCard } from '@/components/StatCard'
import { EmptyState } from '@/components/EmptyState'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { Kua } from '@/lib/types'

const emptyForm = {
  syarat: '',
  status_cpp: false,
  status_cpw: false,
  catatan: '',
}

export function KuaPage() {
  const { rows, loading, insert, update, remove } = useCollection<Kua>('kua', {
    orderBy: 'created_at',
    ascending: true,
  })
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Kua | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const stats = useMemo(() => {
    const cpp = rows.filter((k) => k.status_cpp).length
    const cpw = rows.filter((k) => k.status_cpw).length
    return { cpp, cpw, total: rows.length }
  }, [rows])

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  function openEdit(k: Kua) {
    setEditing(k)
    setForm({
      syarat: k.syarat,
      status_cpp: k.status_cpp,
      status_cpw: k.status_cpw,
      catatan: k.catatan ?? '',
    })
    setDialogOpen(true)
  }

  async function toggle(k: Kua, field: 'status_cpp' | 'status_cpw') {
    await update(k.id, { [field]: !k[field] })
  }

  async function handleSubmit() {
    if (!form.syarat.trim()) return
    setSaving(true)
    const payload = {
      syarat: form.syarat.trim(),
      status_cpp: form.status_cpp,
      status_cpw: form.status_cpw,
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
        title="Dokumen KUA"
        description="Checklist persyaratan dokumen untuk CPP & CPW"
        actions={
          <Button onClick={openCreate}>
            <Plus className="size-4" /> Tambah Syarat
          </Button>
        }
      />

      {loading ? (
        <Skeleton className="h-28 rounded-xl" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            label="Total Persyaratan"
            value={stats.total}
            icon={FileText}
            accent="rose"
          />
          <StatCard
            label="CPP Lengkap"
            value={`${stats.cpp}/${stats.total}`}
            accent="blue"
          />
          <StatCard
            label="CPW Lengkap"
            value={`${stats.cpw}/${stats.total}`}
            accent="green"
          />
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Persyaratan Dokumen</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-12 rounded-lg" />
              ))}
            </div>
          ) : rows.length === 0 ? (
            <div className="p-4">
              <EmptyState
                icon={FileText}
                title="Belum ada persyaratan"
                description="Tambahkan persyaratan dokumen nikah KUA dan tandai per pihak."
                action={
                  <Button onClick={openCreate} variant="outline">
                    <Plus className="size-4" /> Tambah Syarat
                  </Button>
                }
              />
            </div>
          ) : (
            <>
              {/* header row */}
              <div className="hidden items-center gap-3 border-b px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:flex">
                <span className="flex-1">Persyaratan</span>
                <span className="w-12 text-center">CPP</span>
                <span className="w-12 text-center">CPW</span>
                <span className="w-16" />
              </div>
              <div className="divide-y">
                {rows.map((k) => (
                  <div
                    key={k.id}
                    className="group flex items-center gap-3 px-4 py-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{k.syarat}</p>
                      {k.catatan && (
                        <p className="text-xs text-muted-foreground">
                          {k.catatan}
                        </p>
                      )}
                    </div>
                    <div className="flex w-12 justify-center">
                      <Checkbox
                        checked={k.status_cpp}
                        onCheckedChange={() => toggle(k, 'status_cpp')}
                      />
                    </div>
                    <div className="flex w-12 justify-center">
                      <Checkbox
                        checked={k.status_cpw}
                        onCheckedChange={() => toggle(k, 'status_cpw')}
                      />
                    </div>
                    <div className="flex w-16 justify-end gap-1">
                      <Button aria-label="Edit"
                        size="icon"
                        variant="ghost"
                        className="size-8"
                        onClick={() => openEdit(k)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button aria-label="Hapus"
                        size="icon"
                        variant="ghost"
                        className="size-8 text-muted-foreground hover:text-destructive"
                        onClick={() => setDeleteId(k.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing ? 'Edit Persyaratan' : 'Tambah Persyaratan'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Persyaratan</Label>
              <Input
                placeholder="mis. Fotokopi KTP"
                value={form.syarat}
                onChange={(e) =>
                  setForm((f) => ({ ...f, syarat: e.target.value }))
                }
              />
            </div>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={form.status_cpp}
                  onCheckedChange={(v) =>
                    setForm((f) => ({ ...f, status_cpp: !!v }))
                  }
                />
                CPP sudah lengkap
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={form.status_cpw}
                  onCheckedChange={(v) =>
                    setForm((f) => ({ ...f, status_cpw: !!v }))
                  }
                />
                CPW sudah lengkap
              </label>
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
              disabled={saving || !form.syarat.trim()}
            >
              {saving ? 'Menyimpan…' : 'Simpan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Hapus persyaratan ini?"
        onConfirm={async () => {
          if (deleteId) await remove(deleteId)
          setDeleteId(null)
        }}
      />
    </div>
  )
}
