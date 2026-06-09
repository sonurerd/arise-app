import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { LogIn, UserPlus } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { googleSignInUrl } from '../lib/api'

type Mode = 'signin' | 'signup'

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  )
}

export function Auth() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from || '/'

  const [mode, setMode] = useState<Mode>('signin')

  useEffect(() => {
    if (user) navigate(from, { replace: true })
  }, [user, from, navigate])

  const startGoogleAuth = () => {
    window.location.href = googleSignInUrl(from)
  }

  return (
    <div className="arise-bg min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-black gradient-text tracking-tighter">ARISE</h1>
          <p className="text-xs text-zinc-500 mt-3 tracking-[0.35em] uppercase">Behavioral Operating System</p>
        </div>

        <div className="glass p-8">
          <div className="flex gap-2 mb-8 p-1 bg-zinc-900/60 rounded-xl">
            <button
              type="button"
              onClick={() => setMode('signin')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                mode === 'signin'
                  ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <LogIn size={16} />
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setMode('signup')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                mode === 'signup'
                  ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <UserPlus size={16} />
              Sign Up
            </button>
          </div>

          <div className="space-y-5 text-center">
            <p className="text-sm text-zinc-400">
              {mode === 'signin'
                ? 'Sign in with your Google account to continue.'
                : 'Create your account with Google — one tap, no password.'}
            </p>

            <button
              type="button"
              onClick={startGoogleAuth}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl bg-white text-zinc-800 font-semibold text-sm hover:bg-zinc-100 transition-colors shadow-lg shadow-black/20"
            >
              <GoogleIcon />
              {mode === 'signin' ? 'Sign in with Google' : 'Sign up with Google'}
            </button>

            <p className="text-xs text-zinc-600">
              Accounts are linked to Google only. No username or password required.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}