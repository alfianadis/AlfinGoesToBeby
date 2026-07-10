import { useEffect, useRef, useState } from 'react'
import {
  Plus,
  Image as ImageIcon,
  Trash2,
  FileText,
  Upload,
  X,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth'
import { PageHeader } from '@/components/PageHeader'
import { EmptyState } from '@/components/EmptyState'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { formatDate } from '@/lib/format'
import type { Moodboard } from '@/lib/types'

const BUCKET = 'moodboard'
const MAX_SIZE = 10 * 1024 * 1024

export function MoodboardPage() {
  const { user } = useAuth()
  const [rows, setRows] = useState<Moodboard[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [judul, setJudul] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [deleteItem, setDeleteItem] = useState<Moodboard | null>(null)
  const [lightbox, setLightbox] = useState<Moodboard | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  async function fetchRows() {
    setLoading(true)
    const { data, error } = await supabase
      .from('moodboard')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) toast.error(`Gagal memuat: ${error.message}`)
    else setRows((data ?? []) as Moodboard[])
    setLoading(false)
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchRows()
  }, [])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setLightbox(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  function onPickFile(f: File | null) {
    setFile(f)
    if (preview) URL.revokeObjectURL(preview)
    if (f && f.type.startsWith('image/')) {
      setPreview(URL.createObjectURL(f))
    } else {
      setPreview(null)
    }
    if (f && !judul) setJudul(f.name.replace(/\.[^.]+$/, ''))
  }

  function openCreate() {
    setJudul('')
    setFile(null)
    setPreview(null)
    setDialogOpen(true)
  }

  async function handleUpload() {
    if (!file) {
      toast.error('Pilih file dulu')
      return
    }
    if (file.size > MAX_SIZE) {
      toast.error('File terlalu besar (maks 10MB)')
      return
    }
    setUploading(true)
    try {
      const ext = file.name.split('.').pop() ?? 'bin'
      const path = `${crypto.randomUUID()}.${ext}`
      const { error: upErr } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { contentType: file.type, upsert: false })
      if (upErr) throw upErr

      const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path)

      const { error: dbErr } = await supabase.from('moodboard').insert({
        judul: judul.trim() || file.name,
        storage_path: path,
        file_url: pub.publicUrl,
        mime: file.type,
        ukuran: file.size,
        created_by: user?.id ?? null,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any)
      if (dbErr) throw dbErr

      toast.success('Berhasil diunggah')
      setDialogOpen(false)
      await fetchRows()
    } catch (err) {
      toast.error(`Gagal upload: ${(err as Error).message}`)
    } finally {
      setUploading(false)
    }
  }

  async function handleDelete(item: Moodboard) {
    if (item.storage_path) {
      await supabase.storage.from(BUCKET).remove([item.storage_path])
    }
    const { error } = await supabase.from('moodboard').delete().eq('id', item.id)
    if (error) toast.error(`Gagal menghapus: ${error.message}`)
    else {
      toast.success('Dihapus')
      await fetchRows()
    }
    setDeleteItem(null)
  }

  const isImage = (m: Moodboard) => m.mime?.startsWith('image/')

  return (
    <div className="space-y-8">
      <PageHeader
        title="Moodboard"
        description="Kumpulan inspirasi & referensi visual (gambar / PDF)"
        actions={
          <Button onClick={openCreate}>
            <Plus className="size-4" /> Unggah
          </Button>
        }
      />

      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-xl" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <EmptyState
          icon={ImageIcon}
          title="Belum ada inspirasi"
          description="Unggah gambar atau PDF referensi dekorasi, busana, dan lainnya."
          action={
            <Button onClick={openCreate} variant="outline">
              <Upload className="size-4" /> Unggah
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {rows.map((m) => (
            <Card key={m.id} className="group relative overflow-hidden p-0">
              <button
                className="block w-full"
                onClick={() =>
                  isImage(m)
                    ? setLightbox(m)
                    : window.open(m.file_url ?? '', '_blank')
                }
              >
                <div className="flex aspect-square items-center justify-center bg-muted">
                  {isImage(m) ? (
                    <img
                      src={m.file_url ?? ''}
                      alt={m.judul ?? ''}
                      loading="lazy"
                      className="size-full object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <FileText className="size-12 text-muted-foreground" />
                  )}
                </div>
              </button>
              <div className="flex items-center justify-between gap-2 p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{m.judul}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(m.created_at)}
                  </p>
                </div>
                <Button aria-label="Hapus"
                  size="icon"
                  variant="ghost"
                  className="size-7 shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => setDeleteItem(m)}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Upload dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Unggah ke Moodboard</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>File (gambar / PDF, maks 10MB)</Label>
              <input
                ref={fileRef}
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
              />
              {preview ? (
                <button
                  onClick={() => fileRef.current?.click()}
                  className="relative block w-full overflow-hidden rounded-lg border"
                >
                  <img
                    src={preview}
                    alt="preview"
                    className="max-h-48 w-full object-cover"
                  />
                </button>
              ) : (
                <button
                  onClick={() => fileRef.current?.click()}
                  className="flex w-full flex-col items-center gap-2 rounded-lg border border-dashed py-8 text-muted-foreground transition-colors hover:bg-muted/50"
                >
                  <Upload className="size-6" />
                  <span className="text-sm">
                    {file ? file.name : 'Klik untuk pilih file'}
                  </span>
                </button>
              )}
            </div>
            <div className="space-y-2">
              <Label>Judul</Label>
              <Input
                placeholder="mis. Referensi dekorasi"
                value={judul}
                onChange={(e) => setJudul(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleUpload} disabled={uploading || !file}>
              {uploading ? 'Mengunggah…' : 'Unggah'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            aria-label="Tutup"
            className="absolute right-4 top-4 text-white/80 hover:text-white"
            onClick={() => setLightbox(null)}
          >
            <X className="size-7" />
          </button>
          <img
            src={lightbox.file_url ?? ''}
            alt={lightbox.judul ?? ''}
            className="max-h-[90vh] max-w-full rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <ConfirmDialog
        open={!!deleteItem}
        onOpenChange={(o) => !o && setDeleteItem(null)}
        title="Hapus item ini?"
        description="File juga akan dihapus dari penyimpanan."
        onConfirm={() => {
          if (deleteItem) handleDelete(deleteItem)
        }}
      />
    </div>
  )
}
