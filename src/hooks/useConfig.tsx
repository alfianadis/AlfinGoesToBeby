import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { supabase } from '@/lib/supabase'

export interface AppConfig {
  nama_app?: string
  tanggal_pernikahan?: string
  nama_pasangan_1?: string
  nama_pasangan_2?: string
}

interface ConfigContextValue {
  config: AppConfig
  loading: boolean
  refresh: () => Promise<void>
  updateConfig: (key: keyof AppConfig, value: string) => Promise<void>
}

const ConfigContext = createContext<ConfigContextValue | undefined>(undefined)

export function ConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<AppConfig>({})
  const [loading, setLoading] = useState(true)

  async function load() {
    const { data, error } = await supabase.from('config').select('key, value')
    if (!error && data) {
      const map: AppConfig = {}
      data.forEach((row: { key: string; value: string | null }) => {
        if (row.value != null) (map as Record<string, string>)[row.key] = row.value
      })
      setConfig(map)
    }
    setLoading(false)
  }

  async function updateConfig(key: keyof AppConfig, value: string) {
    const { error } = await supabase
      .from('config')
      .upsert({ key, value }, { onConflict: 'key' })
    if (!error) {
      setConfig((prev) => ({ ...prev, [key]: value }))
    } else {
      throw error
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load()
  }, [])

  return (
    <ConfigContext.Provider value={{ config, loading, refresh: load, updateConfig }}>
      {children}
    </ConfigContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useConfig() {
  const ctx = useContext(ConfigContext)
  if (!ctx) throw new Error('useConfig must be used within ConfigProvider')
  return ctx
}
