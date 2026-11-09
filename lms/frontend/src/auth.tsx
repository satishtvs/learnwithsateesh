import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createContext, useContext, type ReactNode } from 'react'
import { getMe, logout as apiLogout, type User } from './api'

interface AuthCtx {
  user: User | null
  loading: boolean
  refresh: () => Promise<void>
  signOut: () => Promise<void>
}

const Ctx = createContext<AuthCtx>(null!)

export function AuthProvider({ children }: { children: ReactNode }) {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ['me'], queryFn: getMe, retry: false })

  const value: AuthCtx = {
    user: data ?? null,
    loading: isLoading,
    refresh: async () => {
      await qc.invalidateQueries({ queryKey: ['me'] })
    },
    signOut: async () => {
      await apiLogout()
      qc.setQueryData(['me'], null)
    },
  }
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export const useAuth = () => useContext(Ctx)
