import { useMemo, useState } from 'react'
import { Plus, Users, Pencil, Trash2, UserCheck } from 'lucide-react'
import { useCollection } from '@/hooks/useCollection'
import { PageHeader } from '@/components/PageHeader'
import { StatCard } from '@/components/StatCard'
import { EmptyState } from '@/components/EmptyState'
import { ConfirmDialog } from '@/components/ConfirmDialog'
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
import type { Tamu, TamuStatus, TamuPihak } from '@/lib/types'

const STATUS_TONE: Record<TamuStatus, 'neutral' | 'blue' | 'green' | 'red'> = {
  belum: 'neutral',
  terkirim: 'blue',
  hadir: 'green',
  'tidak hadir': 'red',
}
const STATUS_LABEL: Record<TamuStatus, string> = {
  belum: 'Belum',
  terkirim: 'Terkirim',
  hadir: 'Hadir',
  'tidak hadir': 'Tidak hadir',
}

const PIHAK_LABEL: Record<TamuPihak, string> = {
  CPP: 'Calon Pengantin Pria',
  CPW: 'Calon Pengantin Wanita',
  Bersama: 'Bersama / Lainnya',
}

const PIHAK_ORDER: TamuPihak[] = ['CPP', 'CPW', 'Bersama']

const emptyForm = {
  nama: '',
  relasi: '',
  jumlah_orang: '1',
  status_undangan: 'belum' as TamuStatus,
  pihak: 'CPP' as TamuPihak,
  catatan: '',
}

interface PihakStats {
  totalGrup: number
  totalOrang: number
  hadir: number
}

function computeStats(items: Tamu[]): PihakStats {
  return {
    totalGrup: items.length,
    totalOrang: items.reduce((s, t) => s + Number(t.jumlah_orang), 0),
    hadir: items
      .filter((t) => t.status_undangan === 'hadir')
      .reduce((s, t) => s + Number(t.jumlah_orang), 0),
  }
}

export function TamuPage() {
  const { rows, loading, insert, update, remove } = useCollection<Tamu>('tamu', {
    orderBy: 'created_at',
    ascending: true,
  })
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Tamu | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const grouped = useMemo(() => {
    const map: Record<TamuPihak, Tamu[]> = { CPP: [], CPW: [], Bersama: [] }
    rows.forEach((t) => {
      const key = (t.pihak ?? 'Bersama') as TamuPihak
      map[key].push(t)
    })
    return map
  }, [rows])

  const stats = useMemo(() => {
    const all = computeStats(rows)
    const cpp = computeStats(grouped.CPP)
    const cpw = computeStats(grouped.CPW)
    const terkirim = rows.filter(
      (t) => t.status_undangan === 'terkirim',
    ).length
    return { all, cpp, cpw, terkirim }
  }, [rows, grouped])

  function openCreate(pihak?: TamuPihak) {
    setEditing(null)
    setForm({ ...emptyForm, pihak: pihak ?? 'CPP' })
    setDialogOpen(true)
  }

  function openEdit(t: Tamu) {
    setEditing(t)
    setForm({
      nama: t.nama,
      relasi: t.relasi ?? '',
      jumlah_orang: String(t.jumlah_orang ?? 1),
      status_undangan: t.status_undangan,
      pihak: (t.pihak ?? 'Bersama') as TamuPihak,
      catatan: t.catatan ?? '',
    })
    setDialogOpen(true)
  }

  async function handleSubmit() {
    if (!form.nama.trim()) return
    setSaving(true)
    const payload = {
      nama: form.nama.trim(),
      relasi: form.relasi || null,
      jumlah_orang: Math.max(1, Number(form.jumlah_orang) || 1),
      status_undangan: form.status_undangan,
      pihak: form.pihak,
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
        title="Tamu"
        description="Daftar undangan dipisah per pihak (CPP & CPW)"
        actions={
          <Button onClick={() => openCreate()}>
            <Plus className="size-4" /> Tambah Tamu
          </Button>
        }
      />

      {loading ? (
        <Skeleton className="h-28 rounded-xl" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Diundang"
            value={`${stats.all.totalOrang} orang`}
            icon={Users}
            accent="rose"
            hint={`${stats.all.totalGrup} grup`}
          />
          <StatCard
            label="Pihak CPP"
            value={`${stats.cpp.totalOrang} orang`}
            accent="blue"
            hint={`${stats.cpp.totalGrup} grup`}
          />
          <StatCard
            label="Pihak CPW"
            value={`${stats.cpw.totalOrang} orang`}
            accent="rose"
            hint={`${stats.cpw.totalGrup} grup`}
          />
          <StatCard
            label="Konfirmasi Hadir"
            value={`${stats.all.hadir} orang`}
            icon={UserCheck}
            accent="green"
            hint={`${stats.terkirim} undangan terkirim`}
            />
        </div>
      )}

      {loading ? (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 rounded-lg" />
              ))}
            </div>
          </CardContent>
        </Card>
      ) : rows.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Belum ada tamu"
          description="Tambahkan tamu undangan beserta jumlah orang."
          action={
            <Button onClick={() => openCreate()} variant="outline">
              <Plus className="size-4" /> Tambah Tamu
            </Button>
          }
        />
      ) : (
        <div className="space-y-6">
          {PIHAK_ORDER.map((pihak) => {
            const items = grouped[pihak]
            const s = computeStats(items)
            return (
              <Card key={pihak}>
                <CardHeader className="flex-row items-center justify-between space-y-0">
                  <div>
                    <CardTitle className="text-base">
                      {PIHAK_LABEL[pihak]}
                    </CardTitle>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {s.totalGrup} grup · {s.totalOrang} orang
                      {s.hadir > 0 && ` · ${s.hadir} hadir`}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openCreate(pihak)}
                  >
                    <Plus className="size-4" /> Tambah
                  </Button>
                </CardHeader>
                <CardContent>
                  {items.length === 0 ? (
                    <p className="py-6 text-center text-sm text-muted-foreground">
                      Belum ada tamu di pihak ini.
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nama</TableHead>
                            <TableHead>Relasi</TableHead>
                            <TableHead className="text-center">Orang</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="w-20" />
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {items.map((t) => (
                            <TableRow key={t.id}>
                              <TableCell className="font-medium">
                                {t.nama}
                                {t.catatan && (
                                  <p className="text-xs text-muted-foreground">
                                    {t.catatan}
                                  </p>
                                )}
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {t.relasi || '—'}
                              </TableCell>
                              <TableCell className="text-center">
                                {t.jumlah_orang}
                              </TableCell>
                              <TableCell>
                                <StatusBadge tone={STATUS_TONE[t.status_undangan]}>
                                  {STATUS_LABEL[t.status_undangan]}
                                </StatusBadge>
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
            )
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Tamu' : 'Tambah Tamu'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nama</Label>
              <Input
                placeholder="mis. Keluarga Budi"
                value={form.nama}
                onChange={(e) => setForm((f) => ({ ...f, nama: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Pihak</Label>
                <Select
                  value={form.pihak}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, pihak: v as TamuPihak }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CPP">CPP</SelectItem>
                    <SelectItem value="CPW">CPW</SelectItem>
                    <SelectItem value="Bersama">Bersama</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Jumlah Orang</Label>
                <Input
                  type="number"
                  min={1}
                  value={form.jumlah_orang}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, jumlah_orang: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Relasi</Label>
              <Input
                placeholder="mis. Teman kantor"
                value={form.relasi}
                onChange={(e) =>
                  setForm((f) => ({ ...f, relasi: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Status Undangan</Label>
              <Select
                value={form.status_undangan}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, status_undangan: v as TamuStatus }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="belum">Belum</SelectItem>
                  <SelectItem value="terkirim">Terkirim</SelectItem>
                  <SelectItem value="hadir">Hadir</SelectItem>
                  <SelectItem value="tidak hadir">Tidak hadir</SelectItem>
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
            <Button onClick={handleSubmit} disabled={saving || !form.nama.trim()}>
              {saving ? 'Menyimpan…' : 'Simpan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Hapus tamu ini?"
        onConfirm={async () => {
          if (deleteId) await remove(deleteId)
          setDeleteId(null)
        }}
      />
    </div>
  )
}
