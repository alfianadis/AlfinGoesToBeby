import { useEffect, useState } from 'react'
import { Save, User2, CalendarHeart, AppWindow } from 'lucide-react'
import { toast } from 'sonner'
import { useConfig } from '@/hooks/useConfig'
import { PageHeader } from '@/components/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export function PengaturanPage() {
  const { config, loading, updateConfig } = useConfig()

  const [namaApp, setNamaApp] = useState('')
  const [pasangan1, setPasangan1] = useState('')
  const [pasangan2, setPasangan2] = useState('')
  const [tanggal, setTanggal] = useState('')

  const [savingApp, setSavingApp] = useState(false)
  const [savingPasangan, setSavingPasangan] = useState(false)
  const [savingTanggal, setSavingTanggal] = useState(false)

  // Sync form dengan config yang sudah di-load
  useEffect(() => {
    if (!loading) {
      setNamaApp(config.nama_app ?? '')
      setPasangan1(config.nama_pasangan_1 ?? '')
      setPasangan2(config.nama_pasangan_2 ?? '')
      setTanggal(config.tanggal_pernikahan ?? '')
    }
  }, [loading, config])

  async function handleSaveApp() {
    if (!namaApp.trim()) return
    setSavingApp(true)
    try {
      await updateConfig('nama_app', namaApp.trim())
      toast.success('Nama aplikasi berhasil disimpan')
    } catch {
      toast.error('Gagal menyimpan nama aplikasi')
    } finally {
      setSavingApp(false)
    }
  }

  async function handleSavePasangan() {
    if (!pasangan1.trim() || !pasangan2.trim()) return
    setSavingPasangan(true)
    try {
      await updateConfig('nama_pasangan_1', pasangan1.trim())
      await updateConfig('nama_pasangan_2', pasangan2.trim())
      toast.success('Nama pasangan berhasil disimpan')
    } catch {
      toast.error('Gagal menyimpan nama pasangan')
    } finally {
      setSavingPasangan(false)
    }
  }

  async function handleSaveTanggal() {
    if (!tanggal) return
    setSavingTanggal(true)
    try {
      await updateConfig('tanggal_pernikahan', tanggal)
      toast.success('Tanggal pernikahan berhasil disimpan')
    } catch {
      toast.error('Gagal menyimpan tanggal pernikahan')
    } finally {
      setSavingTanggal(false)
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Pengaturan"
        description="Kelola konfigurasi dasar aplikasi"
      />

      <div className="grid gap-6 lg:max-w-2xl">
        {/* Nama Aplikasi */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <AppWindow className="size-5 text-primary" />
              Nama Aplikasi
            </CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="pt-5 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nama-app">Nama yang ditampilkan di sidebar</Label>
              <Input
                id="nama-app"
                placeholder="mis. Wedding Tracker"
                value={namaApp}
                onChange={(e) => setNamaApp(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="flex justify-end">
              <Button
                onClick={handleSaveApp}
                disabled={savingApp || loading || !namaApp.trim()}
              >
                <Save className="size-4" />
                {savingApp ? 'Menyimpan…' : 'Simpan'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Nama Pasangan */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <User2 className="size-5 text-primary" />
              Nama Pasangan
            </CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="pt-5 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="pasangan-1">Pasangan 1 (CPP)</Label>
                <Input
                  id="pasangan-1"
                  placeholder="mis. Awwal"
                  value={pasangan1}
                  onChange={(e) => setPasangan1(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pasangan-2">Pasangan 2 (CPW)</Label>
                <Input
                  id="pasangan-2"
                  placeholder="mis. Ana"
                  value={pasangan2}
                  onChange={(e) => setPasangan2(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Nama ini digunakan di dashboard, keuangan, checklist, dan rundown.
            </p>
            <div className="flex justify-end">
              <Button
                onClick={handleSavePasangan}
                disabled={
                  savingPasangan ||
                  loading ||
                  !pasangan1.trim() ||
                  !pasangan2.trim()
                }
              >
                <Save className="size-4" />
                {savingPasangan ? 'Menyimpan…' : 'Simpan'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tanggal Pernikahan */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarHeart className="size-5 text-primary" />
              Tanggal Pernikahan
            </CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="pt-5 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tanggal">Hari-H pernikahan</Label>
              <Input
                id="tanggal"
                type="date"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                disabled={loading}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Digunakan untuk menghitung countdown di dashboard dan deadline otomatis checklist.
            </p>
            <div className="flex justify-end">
              <Button
                onClick={handleSaveTanggal}
                disabled={savingTanggal || loading || !tanggal}
              >
                <Save className="size-4" />
                {savingTanggal ? 'Menyimpan…' : 'Simpan'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
