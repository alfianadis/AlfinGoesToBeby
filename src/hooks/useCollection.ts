import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/database.types'

type TableName = keyof Database['public']['Tables']

interface UseCollectionOptions {
  /** column to order by */
  orderBy?: string
  ascending?: boolean
}

interface RowBase {
  id: string
}

/**
 * Generic CRUD hook for a Supabase table.
 * Handles fetch/insert/update/delete with optimistic refetch + toasts.
 *
 * Note: because the table name is dynamic, the query builder is accessed
 * through a loosely-typed alias. Call sites still get a typed row via <T>.
 */
export function useCollection<T extends RowBase>(
  table: TableName,
  options: UseCollectionOptions = {},
) {
  const { orderBy = 'created_at', ascending = false } = options
  const [rows, setRows] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Loosely-typed builder for the dynamic table name.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const from = useCallback(() => supabase.from(table) as any, [table])

  const fetchRows = useCallback(async () => {
    const { data, error } = await from()
      .select('*')
      .order(orderBy, { ascending })
    if (error) {
      setError(error.message)
      toast.error(`Gagal memuat data: ${error.message}`)
    } else {
      setRows((data ?? []) as unknown as T[])
      setError(null)
    }
    setLoading(false)
  }, [from, orderBy, ascending])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchRows()
  }, [fetchRows])

  const insert = useCallback(
    async (values: Partial<T>) => {
      const { error } = await from().insert(values as never)
      if (error) {
        toast.error(`Gagal menyimpan: ${error.message}`)
        return false
      }
      toast.success('Data ditambahkan')
      await fetchRows()
      return true
    },
    [from, fetchRows],
  )

  const update = useCallback(
    async (id: string, values: Partial<T>) => {
      // optimistic local update
      setRows((prev) =>
        prev.map((r) => (r.id === id ? { ...r, ...values } : r)),
      )
      const { error } = await from()
        .update(values as never)
        .eq('id', id)
      if (error) {
        toast.error(`Gagal memperbarui: ${error.message}`)
        await fetchRows() // revert on error
        return false
      }
      toast.success('Data diperbarui')
      await fetchRows()
      return true
    },
    [from, fetchRows],
  )

  const remove = useCallback(
    async (id: string) => {
      const { error } = await from().delete().eq('id', id)
      if (error) {
        toast.error(`Gagal menghapus: ${error.message}`)
        return false
      }
      toast.success('Data dihapus')
      await fetchRows()
      return true
    },
    [from, fetchRows],
  )

  return { rows, loading, error, refetch: fetchRows, insert, update, remove }
}
