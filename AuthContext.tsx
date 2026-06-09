import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import {
  clearToken,
  deactivateAccount as deactivateAccountApi,
  fetchMe,
  getToken,
  logoutApi,
  setToken,
  type AuthUser,
} from '../lib/api'

interface AuthContextValue {
  user: AuthUser | null
  loading: boolean
  completeSignIn: (token: string) => Promise<void>
  logout: () => Promise<void>
  deactivateAccount: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = getToken()
    if (!token) {
      setLoading(false)
      return
    }
    fetchMe()
      .then(({ user }) => setUser(user))
      .catch(() => clearToken())
      .finally(() => setLoading(false))
  }, [])

  const completeSignIn = useCallback(async (token: string) => {
    setToken(token)
    const { user } = await fetchMe()
    setUser(user)
  }, [])

  const logout = useCallback(async () => {
    await logoutApi()
    clearToken()
    setUser(null)
  }, [])

  const deactivateAccount = useCallback(async () => {
    await deactivateAccountApi()
    clearToken()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, completeSignIn, logout, deactivateAccount }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}