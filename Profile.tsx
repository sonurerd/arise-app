import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, UserX } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { ApiError } from '../lib/api'

export function Profile() {
  const { state, reset } = useApp()
  const { user, logout, deactivateAccount } = useAuth()
  const navigate = useNavigate()
  const [confirmReset, setConfirmReset] = useState(false)
  const [confirmDeactivate, setConfirmDeactivate] = useState(false)
  const [deactivateInput, setDeactivateInput] = useState('')
  const [deactivating, setDeactivating] = useState(false)
  const [deactivateError, setDeactivateError] = useState('')

  const handleLogout = async () => {
    await logout()
    navigate('/auth')
  }

  const handleDeactivate = async () => {
    if (deactivateInput !== 'DEACTIVATE' || deactivating) return
    setDeactivateError('')
    setDeactivating(true)
    try {
      await deactivateAccount()
      navigate('/auth', { replace: true })
    } catch (err) {
      setDeactivateError(err instanceof ApiError ? err.message : 'Could not deactivate account')
    } finally {
      setDeactivating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-zinc-100 tracking-tight">Profile</h1>
        <p className="text-sm text-zinc-500 mt-1">Lifetime stats and system preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass p-8">
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center">
              <span className="text-3xl font-bold text-[#0a0705]">
                {state.user.name.trim() ? state.user.name[0].toUpperCase() : '?'}
              </span>
            </div>
            <p className="text-2xl font-semibold text-zinc-100 mt-4">
              {state.user.name.trim() || user?.username || 'No name set'}
            </p>
            <p className="text-xs text-zinc-500 mt-1">{user?.email || `@${user?.username}`}</p>
            <p className="text-xs text-zinc-600 mt-2">Member since {state.user.joined}</p>
            <button
              onClick={handleLogout}
              className="mt-4 flex items-center gap-2 px-4 py-2 text-sm rounded-xl border border-zinc-700 text-zinc-400 hover:text-rose-400 hover:border-rose-500/30 hover:bg-rose-500/10 transition-colors"
            >
              <LogOut size={15} />
              Log Out
            </button>
            <button
              onClick={() => navigate('/')}
              className="mt-4 text-sm text-orange-400 hover:text-orange-300 transition-colors"
            >
              Change name on Home
            </button>
          </div>
        </div>

        <div className="glass p-8">
          <h2 className="text-lg font-semibold text-zinc-300 mb-4">Lifetime Stats</h2>
          <div className="grid grid-cols-2 gap-6">
            {[
              ['Disciplined Days', state.user.disciplinedDays],
              ['Level', `${state.user.level} — ${state.user.disciplineState}`],
              ['Total Sessions', state.completedSessions],
              ['Integrity Records', state.integrityHistory.length],
            ].map(([label, value]) => (
              <div key={label as string}>
                <p className="text-xs text-zinc-600 uppercase tracking-wider">{label}</p>
                <p className="text-2xl font-bold text-zinc-200 mt-1">{value}</p>
              </div>
            ))}
          </div>

          <hr className="border-zinc-800 my-6" />
          <p className="text-sm text-rose-400 mb-4">Danger Zone</p>

          <div className="space-y-4">
            <div>
              <p className="text-xs text-zinc-500 mb-2">Reset progress but keep your account</p>
              {!confirmReset ? (
                <button
                  onClick={() => setConfirmReset(true)}
                  className="px-4 py-2 text-sm rounded-xl border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 transition-colors"
                >
                  Reset All Data
                </button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={() => setConfirmReset(false)} className="px-4 py-2 text-sm text-zinc-400">Cancel</button>
                  <button
                    onClick={() => { reset(); setConfirmReset(false); navigate('/') }}
                    className="px-4 py-2 text-sm rounded-xl bg-rose-600 hover:bg-rose-500 text-white transition-colors"
                  >
                    Confirm Reset
                  </button>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-zinc-800">
              <p className="text-xs text-zinc-500 mb-2">
                Permanently delete your account and all data from the database. You can sign in again with the same Google email as a new account.
              </p>
              {!confirmDeactivate ? (
                <button
                  onClick={() => {
                    setConfirmDeactivate(true)
                    setDeactivateInput('')
                    setDeactivateError('')
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-sm rounded-xl border border-rose-500/40 text-rose-300 hover:bg-rose-500/10 transition-colors"
                >
                  <UserX size={15} />
                  Deactivate Account
                </button>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-rose-300">
                    Type <span className="font-mono font-semibold">DEACTIVATE</span> to confirm. This cannot be undone.
                  </p>
                  <input
                    value={deactivateInput}
                    onChange={e => setDeactivateInput(e.target.value)}
                    className="input font-mono text-sm"
                    placeholder="DEACTIVATE"
                    autoComplete="off"
                  />
                  {deactivateError && (
                    <p className="text-xs text-rose-400">{deactivateError}</p>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setConfirmDeactivate(false)
                        setDeactivateInput('')
                        setDeactivateError('')
                      }}
                      className="px-4 py-2 text-sm text-zinc-400"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeactivate}
                      disabled={deactivateInput !== 'DEACTIVATE' || deactivating}
                      className="px-4 py-2 text-sm rounded-xl bg-rose-700 hover:bg-rose-600 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {deactivating ? 'Deleting…' : 'Permanently Delete Account'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}