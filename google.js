const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v3/userinfo'

export function getGoogleConfig() {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '')
  const redirectUri =
    process.env.GOOGLE_REDIRECT_URI || `${frontendUrl}/api/auth/google/callback`

  return { clientId, clientSecret, redirectUri, frontendUrl }
}

export function buildGoogleAuthUrl(state) {
  const { clientId, redirectUri } = getGoogleConfig()
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'online',
    prompt: 'select_account',
    state,
  })
  return `${GOOGLE_AUTH_URL}?${params.toString()}`
}

export async function exchangeCodeForProfile(code) {
  const { clientId, clientSecret, redirectUri } = getGoogleConfig()

  const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  })

  const tokenData = await tokenRes.json()
  if (!tokenRes.ok) {
    throw new Error(tokenData.error_description || tokenData.error || 'Google token exchange failed')
  }

  const profileRes = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  })

  const profile = await profileRes.json()
  if (!profileRes.ok) {
    throw new Error(profile.error?.message || 'Could not load Google profile')
  }

  if (!profile.sub || !profile.email) {
    throw new Error('Google profile missing required fields')
  }

  return {
    googleId: profile.sub,
    email: profile.email,
    displayName: profile.name || profile.email.split('@')[0],
    picture: profile.picture || null,
  }
}

export function usernameFromEmail(email) {
  const base = email
    .split('@')[0]
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 24)
  return base.length >= 3 ? base : `user_${base || 'google'}`.slice(0, 24)
}