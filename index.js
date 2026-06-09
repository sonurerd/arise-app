import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { randomUUID } from 'crypto'
import { existsSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import db from './db.js'
import { authMiddleware, signToken } from './auth.js'
import { defaultState } from './defaultState.js'
import {
  buildGoogleAuthUrl,
  exchangeCodeForProfile,
  getGoogleConfig,
  usernameFromEmail,
} from './google.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = join(__dirname, '..')
const distPath = join(rootDir, 'dist')
const isProd = process.env.NODE_ENV === 'production'

const app = express()
const PORT = process.env.PORT || 3001

if (isProd) {
  app.set('trust proxy', 1)
} else {
  app.use(cors({ origin: true, credentials: true }))
}

app.use(express.json({ limit: '2mb' }))

const getUserStmt = db.prepare(
  'SELECT id, username, display_name, email, created_at FROM users WHERE id = ?',
)
const getUserByGoogleIdStmt = db.prepare('SELECT * FROM users WHERE google_id = ?')
const getUserByUsernameStmt = db.prepare('SELECT id FROM users WHERE username = ?')
const insertUserStmt = db.prepare(
  'INSERT INTO users (id, google_id, email, username, password_hash, display_name, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
)
const updateGoogleUserStmt = db.prepare(
  'UPDATE users SET email = ?, display_name = ? WHERE id = ?',
)
const insertStateStmt = db.prepare(
  'INSERT INTO user_app_state (user_id, state_json, updated_at) VALUES (?, ?, ?)',
)
const getStateStmt = db.prepare('SELECT state_json FROM user_app_state WHERE user_id = ?')
const upsertStateStmt = db.prepare(`
  INSERT INTO user_app_state (user_id, state_json, updated_at) VALUES (?, ?, ?)
  ON CONFLICT(user_id) DO UPDATE SET state_json = excluded.state_json, updated_at = excluded.updated_at
`)
const deleteUserStmt = db.prepare('DELETE FROM users WHERE id = ?')
const deleteRecoveryChallengesStmt = db.prepare(
  'DELETE FROM password_recovery_challenges WHERE user_id = ?',
)

const oauthStates = new Map()
const OAUTH_STATE_TTL_MS = 10 * 60 * 1000

function userResponse(row) {
  return {
    id: row.id,
    username: row.username,
    displayName: row.display_name || '',
    email: row.email || '',
    createdAt: row.created_at,
  }
}

function uniqueUsername(base) {
  let candidate = base
  let n = 0
  while (getUserByUsernameStmt.get(candidate)) {
    n += 1
    candidate = `${base}${n}`.slice(0, 32)
  }
  return candidate
}

function pruneOAuthStates() {
  const now = Date.now()
  for (const [key, value] of oauthStates.entries()) {
    if (value.expiresAt < now) oauthStates.delete(key)
  }
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

app.get('/api/auth/google', (req, res) => {
  const { clientId, frontendUrl } = getGoogleConfig()
  if (!clientId) {
    const params = new URLSearchParams({
      error: 'Google sign-in is not configured. Add GOOGLE_CLIENT_ID to .env and restart the server.',
    })
    return res.redirect(`${frontendUrl}/auth/callback?${params.toString()}`)
  }

  pruneOAuthStates()
  const state = randomUUID()
  const redirect = String(req.query.redirect || '/')
  oauthStates.set(state, { redirect, expiresAt: Date.now() + OAUTH_STATE_TTL_MS })

  res.redirect(buildGoogleAuthUrl(state))
})

app.get('/api/auth/google/callback', async (req, res) => {
  const { frontendUrl } = getGoogleConfig()
  const fail = message => {
    const params = new URLSearchParams({ error: message })
    res.redirect(`${frontendUrl}/auth/callback?${params.toString()}`)
  }

  const code = String(req.query.code || '')
  const state = String(req.query.state || '')
  const googleError = String(req.query.error || '')

  if (googleError) {
    return fail(googleError === 'access_denied' ? 'Google sign-in was cancelled' : googleError)
  }

  if (!code || !state) {
    return fail('Missing Google authorization response')
  }

  const stored = oauthStates.get(state)
  oauthStates.delete(state)
  if (!stored || stored.expiresAt < Date.now()) {
    return fail('Sign-in session expired — try again')
  }

  try {
    const profile = await exchangeCodeForProfile(code)
    const now = new Date().toISOString()
    let row = getUserByGoogleIdStmt.get(profile.googleId)

    if (!row) {
      const id = randomUUID()
      const username = uniqueUsername(usernameFromEmail(profile.email))
      insertUserStmt.run(
        id,
        profile.googleId,
        profile.email,
        username,
        '',
        profile.displayName,
        now,
      )
      insertStateStmt.run(id, JSON.stringify(defaultState(profile.displayName)), now)
      row = getUserByGoogleIdStmt.get(profile.googleId)
    } else {
      updateGoogleUserStmt.run(profile.email, profile.displayName, row.id)
      row = getUserByGoogleIdStmt.get(profile.googleId)
    }

    const user = getUserStmt.get(row.id)
    const token = signToken(user)
    const params = new URLSearchParams({ token, redirect: stored.redirect })
    res.redirect(`${frontendUrl}/auth/callback?${params.toString()}`)
  } catch (err) {
    console.error('Google callback failed:', err)
    fail(err.message || 'Google sign-in failed')
  }
})

app.post('/api/auth/logout', (_req, res) => {
  res.json({ ok: true })
})

app.delete('/api/auth/account', authMiddleware, (req, res) => {
  const confirm = String(req.body?.confirm || '').trim()
  if (confirm !== 'DEACTIVATE') {
    return res.status(400).json({ error: 'Type DEACTIVATE to confirm full account deletion' })
  }

  const userId = req.user.id

  try {
    deleteRecoveryChallengesStmt.run(userId)
  } catch {
    // legacy table may not exist
  }

  const result = deleteUserStmt.run(userId)
  if (result.changes === 0) {
    return res.status(404).json({ error: 'Account not found' })
  }

  res.json({ ok: true })
})

app.get('/api/auth/me', authMiddleware, (req, res) => {
  const user = getUserStmt.get(req.user.id)
  if (!user) return res.status(404).json({ error: 'User not found' })
  res.json({ user: userResponse(user) })
})

app.get('/api/state', authMiddleware, (req, res) => {
  const row = getStateStmt.get(req.user.id)
  if (!row) {
    const state = defaultState()
    insertStateStmt.run(req.user.id, JSON.stringify(state), new Date().toISOString())
    return res.json({ state })
  }
  try {
    res.json({ state: JSON.parse(row.state_json) })
  } catch {
    res.status(500).json({ error: 'Corrupt state data' })
  }
})

app.put('/api/state', authMiddleware, (req, res) => {
  const { state } = req.body
  if (!state || typeof state !== 'object') {
    return res.status(400).json({ error: 'State object required' })
  }
  upsertStateStmt.run(req.user.id, JSON.stringify(state), new Date().toISOString())
  res.json({ ok: true })
})

if (isProd && existsSync(distPath)) {
  app.use(express.static(distPath, { index: false }))
  app.get(/^(?!\/api).*/, (_req, res) => {
    res.sendFile(join(distPath, 'index.html'))
  })
}

app.listen(PORT, () => {
  const mode = isProd ? 'production' : 'development'
  const url = process.env.FRONTEND_URL || `http://localhost:${PORT}`
  console.log(`ARISE running (${mode}) on port ${PORT}`)
  if (isProd) console.log(`Public URL: ${url}`)
})