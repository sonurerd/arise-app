import type { AppState } from '../types'

const TOKEN_KEY = 'arise_token'

export interface AuthUser {
  id: string
  username: string
  displayName: string
  email: string
  createdAt: string
}

class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem(TOKEN_KEY)
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  }
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(path, { ...options, headers })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new ApiError(data.error || 'Request failed', res.status)
  }
  return data as T
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

export function googleSignInUrl(redirect = '/'): string {
  const params = new URLSearchParams({ redirect })
  return `/api/auth/google?${params.toString()}`
}

export async function logoutApi() {
  try {
    await request('/api/auth/logout', { method: 'POST' })
  } catch {
    // token may already be invalid
  }
}

export async function deactivateAccount() {
  return request<{ ok: boolean }>('/api/auth/account', {
    method: 'DELETE',
    body: JSON.stringify({ confirm: 'DEACTIVATE' }),
  })
}

export async function fetchMe() {
  return request<{ user: AuthUser }>('/api/auth/me')
}

export async function fetchState() {
  return request<{ state: AppState }>('/api/state')
}

export async function saveState(state: AppState) {
  return request<{ ok: boolean }>('/api/state', {
    method: 'PUT',
    body: JSON.stringify({ state }),
  })
}

export { ApiError }