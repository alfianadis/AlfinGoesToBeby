import { useMemo, useState } from 'react'
import {
  Plus,
  ListChecks,
  Pencil,
  Trash2,
  CircleDashed,
  CheckCircle2,
  CalendarDays,
  User,
  AlertCircle,
} from 'lucide-react'
import { useCollection } from '@/hooks/useCollection'
import { useConfig } from '@/hooks/useConfig'
import { PageHeader } from '@/components/PageHeader'
import { StatCard } from '@/components/StatCard'
import { EmptyState } from '@/components/EmptyState'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
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
import { formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Checklist, ChecklistStatus } from '@/lib/types'

// chronological order of preset phases
const PHASE_ORDER = [
  '12+ Bulan',
  '9-12 Bulan',
  '6-9 Bulan',
  '3-6 Bulan',
  '1-3 Bulan',
  '1 Minggu',
  'Hari-H',
  'Setelah',
  'Lainnya',
]

function phaseRank(name: string): number {
  const i = PHASE_ORDER.indexOf(name)
  return i === -1 ? PHASE_ORDER.length : i
}

const emptyForm = {
  task: '',
  kategori: '',
  deadline: '',
  pic: '',
  catatan: '',
}

export function ChecklistPage() {
  const { rows, loading, insert, update, remove } = useCollection<Checklist>(
    'checklist',
    { orderBy: 'created_at', ascending: true },
  )
  const { config } = useConfig()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Checklist | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const picOptions = [config.nama_pasangan_1, config.nama_pasangan_2].filter(
    Boolean,
  ) as string[]

  const stats = useMemo(() => {
    const done = rows.filter((c) => c.status === 'selesai').length
    const proses = rows.filter((c) => c.status === 'proses').length
    const pct = rows.length ? Math.round((done / rows.length) * 100) : 0
    return { done, proses, total: rows.length, pct }
  }, [rows])

  // group by phase, ordered chronologically; tasks within group: unfinished first then deadline
  const groups = useMemo(() => {
    const map: Record<string, Checklist[]> = {}
    rows.forEach((c) => {
      const key = c.kategori || 'Lainnya'
      ;(map[key] ??= []).push(c)
    })
    return Object.entries(map)
      .map(([nama, items]) => {
        const sorted = [...items].sort((a, b) => {
          const aDone = a.status === 'selesai' ? 1 : 0
          const bDone = b.status === 'selesai' ? 1 : 0
          if (aDone !== bDone) return aDone - bDone
          if (!a.deadline) return 1
          if (!b.deadline) return -1
          return a.deadline < b.deadline ? -1 : 1
        })
        const done = items.filter((i) => i.status === 'selesai').length
        return {
          nama,
          items: sorted,
          done,
          total: items.length,
          deadline: items.find((i) => i.deadline)?.deadline ?? null,
        }
      })
      .sort((a, b) => phaseRank(a.nama) - phaseRank(b.nama))
  }, [rows])

  const today = new Date().toISOString().slice(0, 10)

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  function openEdit(c: Checklist) {
    setEditing(c)
    setForm({
      task: c.task,
      kategori: c.kategori ?? '',
      deadline: c.deadline ?? '',
      pic: c.pic ?? '',
      catatan: c.catatan ?? '',
    })
    setDialogOpen(true)
  }

  async function handleSubmit() {
    if (!form.task.trim()) return
    setSaving(true)
    const payload = {
      task: form.task.trim(),
      kategori: form.kategori || null,
      deadline: form.deadline || null,
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
        title="Checklist"
        description="Pantau progress tugas persiapan pernikahan"
        actions={
          <Button onClick={openCreate}>
            <Plus className="size-4" /> Tambah Tugas
          </Button>
        }
      />

      {loading ? (
        <Skeleton className="h-28 rounded-xl" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            label="Selesai"
            value={`${stats.done}/${stats.total}`}
            icon={CheckCircle2}
            accent="green"
          />
          <StatCard
            label="Sedang Dikerjakan"
            value={stats.proses}
            icon={CircleDashed}
            accent="amber"
          />
          <Card className="p-5">
            <p className="text-sm font-medium text-muted-foreground">
              Progress Keseluruhan
            </p>
            <div className="mt-2 flex items-end justify-between">
              <span className="text-2xl font-semibold">{stats.pct}%</span>
            </div>
            <Progress value={stats.pct} className="mt-2" />
          </Card>
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
          icon={ListChecks}
          title="Belum ada tugas"
          description="Tambahkan tugas persiapan, atau kelompokkan berdasarkan fase waktu."
          action={
            <Button onClick={openCreate} variant="outline">
              <Plus className="size-4" /> Tambah Tugas
            </Button>
          }
        />
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="divide-y">
            {groups.map((group) => {
              const groupPct = group.total
                ? Math.round((group.done / group.total) * 100)
                : 0
              const allDone = group.done === group.total
              return (
                <div key={group.nama}>
                  {/* phase sub-header */}
                  <div className="flex items-center gap-3 bg-muted/40 px-4 py-2.5">
                    <span
                      className={cn(
                        'flex h-6 min-w-12 items-center justify-center rounded-md px-2 text-xs font-bold',
                        allDone
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                          : 'bg-primary/10 text-primary',
                      )}
                    >
                      {groupPct}%
                    </span>
                    <h3 className="text-sm font-semibold">{group.nama}</h3>
                    {group.deadline && (
                      <span className="hidden text-xs text-muted-foreground sm:inline">
                        · {formatDate(group.deadline)}
                      </span>
                    )}
                    <span className="ml-auto text-xs font-medium text-muted-foreground">
                      {group.done}/{group.total}
                    </span>
                  </div>

                  {/* tasks */}
                  <div className="divide-y">
                    {group.items.map((c) => {
                      const overdue =
                        c.deadline &&
                        c.deadline < today &&
                        c.status !== 'selesai'
                      return (
                        <div
                          key={c.id}
                          className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/30"
                        >
                          <div className="min-w-0 flex-1">
                            <p
                              className={cn(
                                'text-sm font-medium',
                                c.status === 'selesai' &&
                                  'text-muted-foreground line-through',
                              )}
                            >
                              {c.task}
                            </p>
                            {(c.deadline || c.pic || c.catatan) && (
                              <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                                {c.deadline && (
                                  <span
                                    className={cn(
                                      'inline-flex items-center gap-1',
                                      overdue &&
                                        'font-medium text-destructive',
                                    )}
                                  >
                                    {overdue ? (
                                      <AlertCircle className="size-3" />
                                    ) : (
                                      <CalendarDays className="size-3" />
                                    )}
                                    {formatDate(c.deadline)}
                                  </span>
                                )}
                                {c.pic && (
                                  <span className="inline-flex items-center gap-1">
                                    <User className="size-3" />
                                    {c.pic}
                                  </span>
                                )}
                                {c.catatan && (
                                  <span className="truncate">{c.catatan}</span>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="flex shrink-0 items-center gap-1">
                            <Select
                              value={c.status}
                              onValueChange={(v) =>
                                update(c.id, { status: v as ChecklistStatus })
                              }
                            >
                              <SelectTrigger className="h-7 w-24 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="belum">Belum</SelectItem>
                                <SelectItem value="proses">Proses</SelectItem>
                                <SelectItem value="selesai">Selesai</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button aria-label="Edit"
                              size="icon"
                              variant="ghost"
                              className="size-8"
                              onClick={() => openEdit(c)}
                            >
                              <Pencil className="size-4" />
                            </Button>
                            <Button aria-label="Hapus"
                              size="icon"
                              variant="ghost"
                              className="size-8 text-muted-foreground hover:text-destructive"
                              onClick={() => setDeleteId(c.id)}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Tugas' : 'Tambah Tugas'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tugas</Label>
              <Input
                placeholder="mis. Booking venue"
                value={form.task}
                onChange={(e) => setForm((f) => ({ ...f, task: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Kategori / Fase</Label>
                <Input
                  placeholder="mis. 6-9 Bulan"
                  value={form.kategori}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, kategori: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Deadline</Label>
                <Input
                  type="date"
                  value={form.deadline}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, deadline: e.target.value }))
                  }
                />
              </div>
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
            <Button onClick={handleSubmit} disabled={saving || !form.task.trim()}>
              {saving ? 'Menyimpan…' : 'Simpan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Hapus tugas ini?"
        onConfirm={async () => {
          if (deleteId) await remove(deleteId)
          setDeleteId(null)
        }}
      />
    </div>
  )
}
