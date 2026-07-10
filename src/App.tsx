import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/lib/auth'
import { ConfigProvider } from '@/hooks/useConfig'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { AppLayout } from '@/components/AppLayout'
import { LoginPage } from '@/pages/LoginPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { KeuanganPage } from '@/pages/KeuanganPage'
import { VendorPage } from '@/pages/VendorPage'
import { KategoriPage } from '@/pages/KategoriPage'
import { ChecklistPage } from '@/pages/ChecklistPage'
import { SeserahanPage } from '@/pages/SeserahanPage'
import { KuaPage } from '@/pages/KuaPage'
import { MoodboardPage } from '@/pages/MoodboardPage'
import { TamuPage } from '@/pages/TamuPage'
import { RundownPage } from '@/pages/RundownPage'
import { NotesPage } from '@/pages/NotesPage'
import { KontakPage } from '@/pages/KontakPage'
import { PengaturanPage } from '@/pages/PengaturanPage'
import { Toaster } from '@/components/ui/sonner'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route
              element={
                <ConfigProvider>
                  <AppLayout />
                </ConfigProvider>
              }
            >
              <Route index element={<DashboardPage />} />
              <Route path="keuangan" element={<KeuanganPage />} />
              <Route path="vendor" element={<VendorPage />} />
              <Route path="kategori" element={<KategoriPage />} />
              <Route path="checklist" element={<ChecklistPage />} />
              <Route path="seserahan" element={<SeserahanPage />} />
              <Route path="kua" element={<KuaPage />} />
              <Route path="moodboard" element={<MoodboardPage />} />
              <Route path="tamu" element={<TamuPage />} />
              <Route path="rundown" element={<RundownPage />} />
              <Route path="notes" element={<NotesPage />} />
              <Route path="kontak" element={<KontakPage />} />
              <Route path="pengaturan" element={<PengaturanPage />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster />
    </AuthProvider>
  )
}

export default App
